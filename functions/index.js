const functionsFire = require('firebase-functions');
const admin = require('firebase-admin');
const {
    log,
    info,
    debug,
    warn,
    error,
    write,
  } = require("firebase-functions/logger");
const { Merchant } = require('steplix-emv-qrcps');
const { Constants } = Merchant;
const QRCode = require('qrcode');
const axios = require('axios').default

const functions = functionsFire.region('southamerica-east1')

admin.initializeApp()

const app = admin.app()

exports.verificadorDeAcesso = functions.https.onCall((data, context) => {
    try {
        if (context.auth.token.master == true) {
            return true
        } else if (context.auth.token[data.acesso] == true) {
            return true
        } else {
            throw new functions.https.HttpsError('permission-denied', 'Acesso não liberado.')
        }
    } catch (error) {
        console.log(error)
        throw new functions.https.HttpsError('permission-denied', 'Você não tem permissão para acesso. Você deve contatar um Administrador Master do sistema para liberação de acessos.', error)
        
    }
    
})

exports.liberaERemoveAcessos = functions.https.onCall((data, context) => {
    if (context.auth.token.master == true) {
        return admin.database().ref(`sistemaEscolar/listaDeUsuarios/${data.uid}/acessos/${data.acesso}`).set(data.checked).then(() => {
                return admin.database().ref(`sistemaEscolar/listaDeUsuarios/${data.uid}/acessos/`).once('value').then((snapshot) => {
                    admin.auth().revokeRefreshTokens(data.uid)
                    return admin.auth().setCustomUserClaims(data.uid, snapshot.val())
                    
                    .then(() => {
                        return admin.database().ref(`sistemaEscolar/registroGeral`).push({operacao: 'Concessão e remoção de acessos aos usuários', timestamp: admin.firestore.Timestamp.now(), userCreator: context.auth.uid, dados: data}).then(() => {
                            if (data.checked) {
                                console.log(admin.firestore.Timestamp.now().toDate())
                                if (data.acesso == 'professores') {
                                    return admin.auth().getUser(data.uid).then(user => {
                                        return admin.database().ref(`sistemaEscolar/listaDeProfessores/${data.uid}/`)
                                        .set({nome: user.displayName, email: user.email, timestamp: admin.firestore.Timestamp.now()}).then(() => {
    
                                            return {acesso: 'Acesso concedido'}
                                        }).catch(error => {
                                            throw new functions.https.HttpsError('unknown', error.message, error)
                                        })
                                    }) 
                                } else {
                                    return {acesso: 'Acesso concedido!'}
                                }
                                
                            } else {
                                if (data.acesso == 'professores') {
                                    return admin.database().ref(`sistemaEscolar/listaDeProfessores/${data.uid}/`)
                                    .remove().then(() => {
                                        return {acesso: 'Acesso removido'}
                                    }).catch(error => {
                                        throw new functions.https.HttpsError('unknown', error.message, error)
                                    })
                                } else {
                                    return {acesso: 'Acesso removido!'}
                                }
                                
                            }
                        }).catch(error => {
                            throw new functions.https.HttpsError('unknown', error.message, error)
                        })

                        
                        
                    })
                })    
        }).catch(error => {
            console.log(error)
            throw new functions.https.HttpsError('unknown', error.message)
        })
    } else {
        throw new functions.https.HttpsError('permission-denied', 'Você não têm permissão para realizar esta ação.')
    }
    
})


exports.apagaContas = functions.https.onCall((data, context) => {
    if (context.auth.token.master == true) {
        return admin.auth().deleteUser(data.uid).then(function() {
            return admin.database().ref(`sistemaEscolar/registroGeral`).push({operacao: 'Conta deletada', timestamp: admin.firestore.Timestamp.now(), userCreator: context.auth.uid, dados: data}).then(() => {
                return {answer: 'Usuário deletado com sucesso.'}
            }).catch(error => {
                throw new functions.https.HttpsError('unknown', error.message, error)
            })
            
        }).catch(function(error) {
            throw new functions.https.HttpsError('unknown', error.message)
        })
    } else {
        throw new functions.https.HttpsError('permission-denied', 'Você não tem permissão para executar essa ação')
    }
})


exports.deletaUsersAutomatico = functions.auth.user().onDelete((user) => {
    console.log(user)
    admin.database().ref(`sistemaEscolar/listaDeUsuarios/${user.uid}`).remove().then(() => {
        admin.database().ref(`sistemaEscolar/usuarios/${user.uid}`).remove().then(() => {
            console.log('ok deleted')
            return {ok: 'user deleted'}
        }).catch(error => {
            throw new functions.https.HttpsError('unknown', error.message)
        })
    }).catch(error => {
        throw new functions.https.HttpsError('unknown', error.message)
    })
})

exports.criaContaAluno = functions.database.ref('sistemaEscolar/alunos/{registro}').onCreate((snapshot, context) => {
    var aluno = snapshot.after.val()
    admin.auth().createUser({
        uid: aluno.matriculaAluno,
        email: aluno.emailAluno,
        emailVerified: false,
        password: aluno.senhaAluno,
        displayName: aluno.nomeAluno,
        phoneNumber: "+55" + aluno.celularAluno
    }).then(() => {

    }).catch(error => {
        throw new functions.https.HttpsError('unknown', error.message, error)
    })
})

exports.modificaSenhaContaAluno = functions.database.ref('sistemaEscolar/alunos/{matricula}/senhaAluno').onUpdate((snapshot, context) => {
    async function start() {
        let senhaAluno = snapshot.after.val();
        let matricula = context.params.matricula;
        let firestoreRef = admin.firestore().collection('mail');
        let dadosAluno = await admin.database().ref('sistemaEscolar/alunos/' + matricula).once('value');
        let nomeEscola = await admin.database().ref('sistemaEscolar/infoEscola/dadosBasicos/nomeEscola').once('value');
        let user = await admin.auth().getUserByEmail(dadosAluno.val().emailAluno)
        let emailContent = {
            to: dadosAluno.val().emailAluno,
            message: {
                subject: `${nomeEscola.val()}: Senha alterada no portal do Aluno`,
                text: `Sua nova senha para login no portal do aluno é ${senhaAluno}. Em caso de dificuldades entre em contato com sua escola para maiores informações. Sistemas ProjetoX.`,
                html: `<h3>Olá ${dadosAluno.val().nomeAluno.split(' ')[0]}!</h3><p>O sistema detectou uma mudança na sua senha do portal do aluno e sua nova senha para login no portal do aluno é <b>${senhaAluno}</b>.</p><p>Em caso de dificuldades <b>entre em contato com sua escola para maiores informações</b>.</p><p>Sistemas ProjetoX.</p>`
            }
        }

        admin.auth().updateUser(user.uid, {password: senhaAluno}).then((newUser) => {
            firestoreRef.add(emailContent).then(() => {
                console.log('Queued email for delivery to ' + dadosAluno.val().emailAluno)
            }).catch(error => {
                console.error(error)
                throw new Error(error.message)
            })
        }).catch(error => {
            console.error(error)
            throw new Error(error.message)
        })
    }

    start(() => {
        return 'Function ended';
    }).catch(error => {
        throw new Error(error.message)
    })
      
})

exports.cadastroUser = functions.auth.user().onCreate((user) => {
    console.log(user.displayName) 
    var dadosNoBanco = admin.database().ref(`sistemaEscolar/usuarios/${user.uid}/`)
    var listaDeUsers = admin.database().ref(`sistemaEscolar/listaDeUsuarios`)
    var usuariosMaster = admin.database().ref('sistemaEscolar/usuariosMaster')
    let firestoreRef = app.firestore().collection('mail');

    admin.auth().generateEmailVerificationLink(user.email).then(value => {
        log(value)
        let emailContent = {
            to: user.email,
            message: {
                subject: `Verificação de segurança do Sistema Escolar`,
                text: `Clique no link para verificar seu e-mail no sistema escolar`,
                html: `
                    <p>Olá, ${user.displayName || 'usuário'}</p>
                    <p>Clique neste link para verificar seu endereço de e-mail.</p>
                    <p><a href="${value}">${value}</a></p>
                    <p>Se você não solicitou a verificação deste endereço, ignore este e-mail.</p>
                    <p>Obrigado,</p>
                    <p>Equipe do GrupoProX</p>
                `
            }
        }
        firestoreRef.add(emailContent).then((ref) => {
            console.log('Queued email for delivery to ' + user.email)
        }).catch(error => {
            console.error(error)
        })
    }).catch(error => {
        log(error)
    })

    dadosNoBanco.set({
        nome: user.displayName,
        email: user.email,
        
        timestamp: admin.firestore.Timestamp.now()
    }).then(() => {

    }).catch(error =>{
        throw new functions.https.HttpsError('unknown', error.message)
    })

    listaDeUsers.child(user.uid).set({
        acessos: {
            master: false,
            adm: false,
            secretaria: false,
            professores: false,
            aluno: false
        },
        email: user.email
    }).then(() => {

    }).catch(error => {
        throw new functions.https.HttpsError('unknown', error.message)
    })
    
    usuariosMaster.once('value', (snapshot) => {
        var acessosObj = {
            acessos: {
                master: false,
                adm: false,
                secretaria: false,
                professores: false,
                aluno: false
            }
        }
        var lista = snapshot.val()
        if (lista.indexOf(user.email) != -1) {
            listaDeUsers.child(user.uid + '/acessos/master').set(true).then(() => {

            }).catch(error => {
                throw new functions.https.HttpsError('unknown', error.message)
            })
            acessosObj = {
                master: true,
                adm: false,
                secretria: false,
                professores: false,
                aluno: false
            }
        } else if (user.uid.length == 5){
            listaDeUsers.child(user.uid + '/acessos/aluno').set(true).then(() => {

            }).catch(error => {
                throw new functions.https.HttpsError('unknown', error.message)
            })
            acessosObj = {
                master: false,
                adm: false,
                secretria: false,
                professores: false,
                aluno: true,
            }
        }
        admin.auth().setCustomUserClaims(user.uid, acessosObj).then(() => {

        }).catch(error => {
            throw new functions.https.HttpsError('unknown', error.message)
        })
    })
})

exports.cadastraTurma = functions.https.onCall(async (data, context) => {
    /**{codigoSala: codPadrao, professor: professor, diasDaSemana: diasDaSemana, livros: books, hora: horarioCurso} */
    console.log(data)
    if (context.auth.token.master == true || context.auth.token.secretaria == true) {
        var dados = data
        if (dados.hasOwnProperty('codTurmaAtual')) {
            let turma = dados.codTurmaAtual
            return admin.database().ref(`sistemaEscolar/turmas/${turma}/professor/0`).once('value').then(snapshot => {
                if (snapshot.val()) {
                    throw new functions.https.HttpsError('cancelled', 'Operação cancelada! Desconecte todos os professores desta turma antes de editar a turma', )
                }
                return admin.database().ref(`sistemaEscolar/turmas/${turma}`).once('value').then(async (turmaFire) => {
                    let dadosTurmaAtual = turmaFire.val()
                    

                    async function atualizaAlunos() {
                        Object.keys(dadosTurmaAtual.alunos).map(async (matricula) => {
                            await admin.database().ref('sistemaEscolar/alunos/' + matricula + '/turmaAluno').set(dados.codigoSala)
                        })
                        return ;
                    }

                    if (dadosTurmaAtual.hasOwnProperty("alunos") && Object.keys(dadosTurmaAtual.alunos).length > 0) {
                        await atualizaAlunos();
                    }

                    // Essa parte se repete com as funções de baixo
                    return admin.database().ref(`sistemaEscolar/turmas/${turma}`).remove().then(() => {
                        return admin.database().ref(`sistemaEscolar/registroGeral`).push({operacao: 'Edição das informações de turma do sistema', timestamp: admin.firestore.Timestamp.now(), userCreator: context.auth.uid, dados: {codTurma: turma}}).then(() => {
                            var horario
                    let hora = dados.hora.indexOf('_') == -1 ? dados.hora : dados.hora.split('_')[0]
                    if (hora >= 12 && hora <= 17) {
                        horario = 'Tarde'
                    } else if (hora >= 18 && hora <= 23) {
                        horario = 'Noite'
                    } else if (hora >= 5 && hora <= 11) {
                        horario = 'Manha'
                    } else {
                        throw new functions.https.HttpsError('invalid-argument', 'Você deve passar um horário válido')
                    }
                    return admin.auth().getUserByEmail(data.professor).then(function(user) {
                        dados.professor = [{nome: user.displayName, email: user.email}]
                        dados.timestamp = admin.firestore.Timestamp.now()
                        dados.id = dados.codigoSala
                        return admin.database().ref(`sistemaEscolar/usuarios/${user.uid}/professor/turmas/${data.codigoSala}`).set(true).then(() => {
                            return admin.database().ref(`sistemaEscolar/turmas/${data.codigoSala}/`).once('value').then(snapshot =>{
                                if (snapshot.exists() == false) {
                                    Object.assign(dadosTurmaAtual, dados)
                                    return admin.database().ref(`sistemaEscolar/turmas/${data.codigoSala}/`).set(dadosTurmaAtual).then(() => {
                                        admin.database().ref(`sistemaEscolar/numeros/turmasCadastradas`).transaction(function (current_value) {
                                            return (current_value || 0) + 1
                                        }).catch(function (error) {
                                            throw new functions.https.HttpsError('unknown', error.message, error)
                                        })
                                        return admin.database().ref(`sistemaEscolar/registroGeral`).push({operacao: 'Cadastro de Turma', timestamp: admin.firestore.Timestamp.now(), userCreator: context.auth.uid, dados: dados}).then(() => {
                                            return {answer: 'A turma e todos os seus registros foram alterados com sucesso.'}
                                        }).catch(error => {
                                            throw new functions.https.HttpsError('unknown', error.message, error)
                                        })
                                        
                                        }).catch(error => {
                                            throw new functions.https.HttpsError(error.code, error.message, error)
                                        })
                                } else {
                                    throw new functions.https.HttpsError('already-exists', 'Uma turma com o mesmo código já foi criada.')
                                }
                                
                            })
                        }).catch(error => {
                            throw new functions.https.HttpsError('unknown', error.message, error)
                        })
                        
                            
                    }).catch(function(error) {
                        throw new functions.https.HttpsError('unknown', error.message, error)
                    })
                            
                        }).catch(error => {
                            throw new functions.https.HttpsError('unknown', error.message, error)
                        })
        
                        
                    }).catch(error => {
                        throw new functions.https.HttpsError('unknown', error.message, error)
                    })
                    
                    
                }).catch(error => {
                    throw new functions.https.HttpsError('unknown', error.message, error)
                })
                
                
            }).catch(error => {
                throw new functions.https.HttpsError('unknown', error.message, error)
            })




        } else {
            data.id = data.codigoSala
            var horario
            let hora = dados.hora.indexOf('_') == -1 ? dados.hora : dados.hora.split('_')[0]
            if (hora >= 12 && hora <= 17) {
                horario = 'Tarde'
            } else if (hora >= 18 && hora <= 23) {
                horario = 'Noite'
            } else if (hora >= 5 && hora <= 11) {
                horario = 'Manha'
            } else {
                throw new functions.https.HttpsError('invalid-argument', 'Você deve passar um horário válido')
            }
            return admin.auth().getUserByEmail(data.professor).then(function(user) {
                dados.professor = [{nome: user.displayName, email: user.email}]
                dados.timestamp = admin.firestore.Timestamp.now()
                return admin.database().ref(`sistemaEscolar/usuarios/${user.uid}/professor/turmas/${data.codigoSala}`).set(true).then(() => {
                    return admin.database().ref(`sistemaEscolar/turmas/${data.codigoSala}/`).once('value').then(snapshot =>{
                        if (snapshot.exists() == false) {
                            return admin.database().ref(`sistemaEscolar/turmas/${data.codigoSala}/`).set(dados).then(() => {
                                admin.database().ref(`sistemaEscolar/numeros/turmasCadastradas`).transaction(function (current_value) {
                                    return (current_value || 0) + 1
                                }).catch(function (error) {
                                    throw new functions.https.HttpsError('unknown', error.message, error)
                                })
                                return admin.database().ref(`sistemaEscolar/registroGeral`).push({operacao: 'Cadastro de Turma', timestamp: admin.firestore.Timestamp.now(), userCreator: context.auth.uid, dados: dados}).then(() => {
                                    return {answer: 'Turma cadastrada com sucesso.'}
                                }).catch(error => {
                                    throw new functions.https.HttpsError('unknown', error.message, error)
                                })
                                
                                }).catch(error => {
                                    throw new functions.https.HttpsError(error.code, error.message, error)
                                })
                        } else {
                            throw new functions.https.HttpsError('already-exists', 'Uma turma com o mesmo código já foi criada.')
                        }
                        
                    })
                }).catch(error => {
                    throw new functions.https.HttpsError('unknown', error.message, error)
                })
                
                    
            }).catch(function(error) {
                throw new functions.https.HttpsError('unknown', error.message, error)
            })
        }
        
        
    } else {
        throw new functions.https.HttpsError('permission-denied', 'Você não possui permissão para fazer alterações nesta área.')
    }
})

exports.cadastraAniversarios = functions.database.ref('sistemaEscolar/usuarios/{uid}/dataNascimento').onWrite((snapshot, context) => {
    var data = snapshot.after.val()
    admin.auth().getUserByEmail(data.email).then((user) => {
        admin.database().ref('sistemaEscolar/aniversarios/' + (data.mes - 1)).push({
            nome: user.displayName,
            email: user.email,
            dataNascimento: {dia: data.dia, mes: data.mes, ano: data.ano}
        }).then(() => {
            return {message: 'Aniversario cadastrado'}
        }).catch(error => {
            throw new functions.https.HttpsError('unknown', error.message, error)
        })
    }).catch(error => {
        throw new functions.https.HttpsError('unknown', error.message, error)
    })
})

exports.addNovoProfTurma = functions.https.onCall((data, context) => {
    if (context.auth.token.master == true || context.auth.token.secretaria == true) {
        return admin.auth().getUserByEmail(data.emailProf).then(function(user) {
            return admin.database().ref(`sistemaEscolar/usuarios/${user.uid}/professor/turmas/${data.codSala}`).set(true).then(() => {
                return admin.database().ref('sistemaEscolar/turmas').child(data.codSala).child('professor').once('value').then(snapshot => {
                    var listaProf = snapshot.val()
                    if (listaProf == null) {
                        var listaProf = []
                    }
                    listaProf.push({email: data.emailProf, nome: user.displayName})
                    return admin.database().ref('sistemaEscolar/turmas').child(data.codSala).child('professor').set(listaProf).then(() => {
                        return admin.database().ref(`sistemaEscolar/registroGeral`).push({operacao: 'Professor conectado em uma turma', timestamp: admin.firestore.Timestamp.now(), userCreator: context.auth.uid, dados: data}).then(() => {
                            return {answer: 'Professor adicionado com sucesso'}
                        }).catch(error => {
                            throw new functions.https.HttpsError('unknown', error.message, error)
                        })
                        
                    }).catch(error => {
                        throw new functions.https.HttpsError('unknown', error.message, error)
                    })
               }).catch(error => {
                   throw new functions.https.HttpsError('unknown', error.message, error)
               })
            }).catch(error => {
                throw new functions.https.HttpsError('unknown', error.message, error)
            }) 
        }).catch(function(error){
            throw new functions.https.HttpsError('unknown', error.message, error)
        })
    } else {
        throw new functions.https.HttpsError('permission-denied', 'Você não possui permissão para fazer alterações nesta área.')
    }

})

exports.desconectaProf = functions.database.ref('sistemaEscolar/turmas/{codTurma}/professor/{iProf}').onDelete((snapshot, context) => {
    // context.params = { codTurma: 'KIDS-SAT08', iProf: '1' }
    // context.timestamp = context.timestamp
    
    var turma = context.params.codTurma
    var professor = snapshot.val().email
    return admin.auth().getUserByEmail(professor).then(user => {
        return admin.database().ref(`sistemaEscolar/usuarios/${user.uid}/professor/turmas/${turma}`).remove().then(() => {
            return admin.database().ref(`sistemaEscolar/turmas/${turma}/professor`).once('value').then(teachersData => {
                if (teachersData.exists()) {
                    let teachers = teachersData.val()
                    let teachersArray = []
                    for (const i in teachers) {
                        if (Object.hasOwnProperty.call(teachers, i)) {
                            const teacher = teachers[i];
                            teachersArray.push(teacher)
                        }
                    }

                    return admin.database().ref(`sistemaEscolar/turmas/${turma}/professor`).set(teachersArray).then(() => {
                        return {answer: 'Professor desconectado.'}
                    }).catch(error => {
                        throw new functions.https.HttpsError('unknown', error)
                    })
                }
                
            })
        }).catch(error => {
            throw new functions.https.HttpsError('unknown', error)
        })
    }).catch(error => {
        throw new functions.https.HttpsError('not-found', error.message, error)
    })

    
}) 

exports.cadastraAluno = functions.https.onCall(async (data, context) => {
    function formataNumMatricula(num) {
        let numero = num
        numero = "00000" + numero.replace(/\D/g, '');
        numero = numero.slice(-5,-1) + numero.slice(-1);
        return numero
    }
    if (data.dados.tipoMatricula === 'preMatricula' || context.auth.token.master == true || context.auth.token.secretaria == true) {
        let dadosAluno = data.dados
        if (dadosAluno.tipoMatricula == 'preMatricula') {
            delete dadosAluno.tipoMatricula
            
            let firestoreRef = admin.firestore().collection('mail');
            let infoEscola = await admin.database().ref('sistemaEscolar/infoEscola/dadosBasicos').once('value')
            let dadosEscola = infoEscola.val()
            const responsavelPedagogico = {email: null}
            try {
                responsavelPedagogico = dadosAluno.responsaveis.find(responsavel => responsavel.pedagogico == true) || dadosAluno.responsaveis[0]
            } catch (error) {
                console.log(error)
            }
            
            

            dadosAluno.timestamp = admin.firestore.Timestamp.now()
            dadosAluno.userCreator = 'Anonymous'

            let emailContent = {
                to: dadosAluno.emailAluno,
                cc: dadosAluno.emailResponsavelPedagogico || null,
                message: {
                    subject: `${dadosEscola.nomeEscola}`,
                    text: `Olá ${dadosAluno.nomeAluno.split(' ')[0]}, sua pré matrícula foi cadastrada. Sistemas GrupoProX.`,
                    html: `<h3>Olá ${dadosAluno.nomeAluno.split(' ')[0]}!</h3><p>Sua Pré-Matrícula foi cadastrada com sucesso. Fique atento aos e-mails. Nós poderemos utilizar este meio para entrar em contato e passar informações importantes.</p><p>Em caso de dúvidas ou dificuldades <b>entre em contato com a escola para maiores informações</b>.</p><p><b>Dados de contato da escola:</b><br>Telefone: ${dadosEscola.telefoneEscola}<br>E-mail: ${dadosEscola.emailEscola}<br>Endereço: ${dadosEscola.enderecoEscola}</p><p>Sistemas GrupoProX.</p>`
                }
            }

            return admin.database().ref('/sistemaEscolar/preMatriculas').push(dadosAluno).then(() => {
                return firestoreRef.add(emailContent).then(() => {
                    console.log('Queued email for delivery to ' + dadosAluno.emailAluno)
                    return {answer: 'Pré-matrícula enviada com sucesso! Um e-mail será enviado para o aluno, informando sobre este cadastro.'}
                    
                }).catch(error => {
                    console.error(error)
                    throw new Error(error.message)
                })
                
            }).catch(error => {
                throw new functions.https.HttpsError('unknown', error.message, error)
            })

        } else {
            let preMatriculaKey = data.preMatricula
            delete dadosAluno.tipoMatricula
            let contratoConfigurado = data.contratoConfigurado
            let planoOriginal = data.planoOriginal
            let codContrato = !data.codContrato ? admin.database().ref('/').push().key : data.codContrato;
            let contratos = [codContrato]
            let ultimaMatricula = (await admin.database().ref('sistemaEscolar/ultimaMatricula').once('value')).val()
            dadosAluno.matriculaAluno = !dadosAluno.matriculaAluno ? formataNumMatricula(String(Number(ultimaMatricula) + 1)) : dadosAluno.matriculaAluno
            let firestoreRef = admin.firestore().collection('mail');
            let infoEscola = await admin.database().ref('sistemaEscolar/infoEscola/dadosBasicos').once('value')
            let dadosEscola = infoEscola.val()
            let emailContent = {
                to: dadosAluno.emailAluno,
                cc: dadosAluno.emailResponsavelPedagogico || null,
                message: {
                    subject: `${dadosEscola.nomeEscola}`,
                    text: `Olá ${dadosAluno.nomeAluno.split(' ')[0]}, você foi corretamente cadastrado(a) em nosso sistema e está pronto(a) para iniciar essa jornada conosco. Sistemas GrupoProX.`,
                    html: `<h3>Olá ${dadosAluno.nomeAluno.split(' ')[0]}!</h3><p>Você está matriculado(a) no nº de matrícula <b>${dadosAluno.matriculaAluno}</b>, e está pronto(a) para iniciar os estudos conosco. Use seu e-mail e senha cadastrados para acessar o sistema. Só lembrando, sua senha é: <b>${dadosAluno.senhaAluno}</b>. Fique atento aos e-mails, pois sua escola pode utilizar este canal para comunicação com você.</p><p>Em caso de dificuldades <b>entre em contato com a escola para maiores informações</b>.</p><p><b>Dados de contato da escola:</b><br>Telefone: ${dadosEscola.telefoneEscola}<br>E-mail: ${dadosEscola.emailEscola}<br>Endereço: ${dadosEscola.enderecoEscola}</p><p>Sistemas GrupoProX.</p>`
                }
            }
            dadosAluno.userCreator = context.auth.uid
            dadosAluno.contratos = contratos
            dadosAluno.timestamp = admin.firestore.Timestamp.now()
            return admin.database().ref('sistemaEscolar/alunos').child(dadosAluno.matriculaAluno).once('value').then(alunoRecord => {
                if (alunoRecord.exists()) {
                    throw new functions.https.HttpsError('already-exists', 'Este número de matrícula já consta no sistema. Por favor, clique no botão azul no início deste formulário para atualizar o número de matrícula, para gerar um novo número de matrícula.')
                }
                    return admin.database().ref('sistemaEscolar/alunos/' + dadosAluno.matriculaAluno).set(dadosAluno).then(() => {
                        return admin.database().ref('sistemaEscolar/infoEscola/contratos/' + codContrato).set({contratoConfigurado: contratoConfigurado, situacao: 'Vigente', planoOriginal: planoOriginal, matricula: dadosAluno.matriculaAluno, timestamp: admin.firestore.Timestamp.now(), codContrato: codContrato}).then(() => {
                            return admin.database().ref('sistemaEscolar/turmas').child(dadosAluno.turmaAluno + '/alunos').child(dadosAluno.matriculaAluno).set({nome: dadosAluno.nomeAluno, prof: (dadosAluno.emailProfAluno || dadosAluno.profAluno.email)}).then(() => {
                                return admin.database().ref('sistemaEscolar/ultimaMatricula').set(dadosAluno.matriculaAluno).then(() => {
                                    if (preMatriculaKey) {
                                        admin.database().ref('sistemaEscolar/preMatriculas').child(preMatriculaKey).remove().then(() => {

                                        }).catch((error) => {
                                            log(error)
                                        })
                                    }
                                    
                                    
                                    admin.database().ref('sistemaEscolar/numeros/alunosMatriculados').transaction(function (current_value) {
                                        let numAtual = Number(current_value)
                                        if (current_value == null) {
                                            return 1
                                        } else {
                                            return numAtual++
                                        }
                                    }, function(error, comitted, snapshot){
                                        if (error) {
                                            throw new functions.https.HttpsError(error.code, error.message, error)
                                        } else if(!comitted) {
                                            throw new functions.https.HttpsError('already-exists', 'Já existe. Isso pode ser um erro. Tente novamente.')
                                        }
                                        
                                    })

                                    return firestoreRef.add(emailContent).then(() => {
                                        console.log('Queued email for delivery to ' + dadosAluno.emailAluno)
                                        return {answer: 'Aluno cadastrado na matrícula '+ dadosAluno.matriculaAluno + ' com sucesso! Os e-mails foram disparados.', codContrato: codContrato}
                                        
                                    }).catch(error => {
                                        console.error(error)
                                        throw new Error(error.message)
                                    })
                                
                                }).catch(error => {
                                    throw new functions.https.HttpsError('unknown', error.message, error)
                                })
                            }).catch(error => {
                                throw new functions.https.HttpsError('unknown', error.message, error)
                            })
                        }).catch(error => {
                            throw new functions.https.HttpsError('unknown', error.message, error)
                        })
                        
                        }).catch(error => {
                            throw new functions.https.HttpsError('unknown', error.message, error)
                        })
                }).catch(error => {
                    throw new functions.https.HttpsError('unknown', error.message, error)
                })
            }
            
        } else {
            throw new functions.https.HttpsError('permission-denied', 'Você não possui permissão para fazer alterações nesta área.')
        }
    })

exports.timestamp = functions.https.onCall((data, context) => {
    return {timestamp: admin.firestore.Timestamp.now()}
    
})

exports.transfereAlunos = functions.https.onCall((data, context) => {
        function formataNumMatricula(num) {
            let numero = num
            numero = "00000" + numero.replace(/\D/g, '');
            numero = numero.slice(-5,-1) + numero.slice(-1);
            return numero
        }
        if (context.auth.token.master == true || context.auth.token.secretaria == true) {
            let dados = data
            let turmaAtual = dados.turmaAtual
            let turmaParaTransferir = dados.turmaParaTransferir
            let alunosSelecionados = dados.alunos
            let alunos = {} //Aqui onde será guardado os alunos e os dados dos mesmos, da turma para serem transferidos para outra turma
            var timestamp = admin.firestore.Timestamp.now()
            
            return admin.database().ref(`sistemaEscolar/turmas/${turmaAtual}/alunos/`).once('value').then(snapshot => {
                let alunosTurma = snapshot.val()
                for (const i in alunosSelecionados) {
                    if (Object.hasOwnProperty.call(alunosSelecionados, i)) {
                        const matricula = alunosSelecionados[i];
                        alunos[formataNumMatricula(matricula)] = alunosTurma[formataNumMatricula(matricula)]
                    }
                }
                console.log(alunos)
                
                return admin.database().ref(`sistemaEscolar/turmas/${turmaParaTransferir}/alunos/`).update(alunos).then(() => {
                    async function removeAlunos() {
                        for (const matricula in alunos) {
                            if (Object.hasOwnProperty.call(alunos, matricula)) {
                                const dadosAluno = alunos[matricula];
                                await admin.database().ref(`sistemaEscolar/turmas/${turmaAtual}/historico`).push({dados: {matricula: matricula, dadosAluno: dadosAluno, turmaAtual: turmaAtual, turmaParaQualFoiTransferido: turmaParaTransferir}, timestamp: timestamp, operacao: 'Transferência de alunos'}).then(() => {
                                    admin.database().ref(`sistemaEscolar/turmas/${turmaAtual}/alunos/${matricula}`).remove().then(() => {
                                        admin.database().ref(`sistemaEscolar/turmas/${turmaParaTransferir}/professor/0`).once('value').then(novoProfessor => {
                                            admin.database().ref(`sistemaEscolar/turmas/${turmaParaTransferir}/alunos/${matricula}/prof/`).set(novoProfessor.val()).then(() =>{
                                                admin.database().ref(`sistemaEscolar/alunos/${matricula}/profAluno/`).set(novoProfessor.val()).then(() =>{
                                                    admin.database().ref(`sistemaEscolar/alunos/${matricula}/turmaAluno/`).set(turmaParaTransferir).then(() =>{
                                                        admin.database().ref(`sistemaEscolar/alunos/${matricula}/historico/`).push({dados: {matricula: matricula, dadosAluno: dadosAluno, turmaAtual: turmaAtual, turmaParaQualFoiTransferido: turmaParaTransferir}, timestamp: timestamp, operacao: 'Transferência de alunos', userCreator: context.auth.uid}).then(() =>{

                                                        }).catch(error => {
                                                            throw new functions.https.HttpsError('unknown', error.message, error)
                                                        })
                                                    }).catch(error => {
                                                        throw new functions.https.HttpsError('unknown', error.message, error)
                                                    })
                                                }).catch(error => {
                                                    throw new functions.https.HttpsError('unknown', error.message, error)
                                                })
                                            }).catch(error => {
                                                throw new functions.https.HttpsError('unknown', error.message, error)
                                            })
                                        }).catch(error => {
                                            throw new functions.https.HttpsError('unknown', error.message, error)
                                        })
                                    }).catch(error => {
                                        throw new functions.https.HttpsError('unknown', error.message, error)
                                    })
                                }).catch(error => {
                                    throw new functions.https.HttpsError('unknown', error.message, error)
                                })
                                
                            }
                        }
                    }
                    return removeAlunos().then(() => {
                        return {answer: 'Os alunos foram transferidos para a outra turma com sucesso.'}
                    }).catch(error => {
                        
                        throw new functions.https.HttpsError('unknown', error.message, error)
                    })
                    
                }).catch(error => {
                    throw new functions.https.HttpsError('unknown', error.message, error)
                })
            }).catch(error => {
                throw new functions.https.HttpsError('unknown', error.message, error)
            })

        
    } else {
        throw new functions.https.HttpsError('permission-denied', 'Você não tem permissão.')
    }
})

exports.excluiTurma = functions.https.onCall((data, context) => {
    if (context.auth.token.master == true || context.auth.token.secretaria == true) {
        let turma = data.codTurma
        return admin.database().ref(`sistemaEscolar/turmas/${turma}/alunos`).once('value').then(students => {
            if (students.val()) {
                throw new functions.https.HttpsError('cancelled', 'Operação cancelada! Desative ou transfira os alunos.', )
            }
            return admin.database().ref(`sistemaEscolar/turmas/${turma}/professor`).once('value').then(snapshot => {
                if (snapshot.val()) {
                    throw new functions.https.HttpsError('cancelled', 'Operação cancelada! Desconecte todos os professores desta turma antes de excluir a turma', )
                }
                return admin.database().ref(`sistemaEscolar/turmas/${turma}`).remove().then(() => {
                    return admin.database().ref(`sistemaEscolar/registroGeral`).push({operacao: 'Exclusão de turma do sistema', timestamp: admin.firestore.Timestamp.now(), userCreator: context.auth.uid, dados: {codTurma: turma}}).then(() => {
                        return {answer: 'A turma e todos os seus registros foram excluídos com sucesso.'}
                    }).catch(error => {
                        throw new functions.https.HttpsError('unknown', error.message, error)
                    })
    
                    
                }).catch(error => {
                    throw new functions.https.HttpsError('unknown', error.message, error)
                })
                
            }).catch(error => {
                throw new functions.https.HttpsError('unknown', error.message, error)
            })
        }).catch(error => {
            throw new functions.https.HttpsError('unknown', error.message, error)
        })
        
        
    } else {
        throw new functions.https.HttpsError('permission-denied', 'Você não possui permissão para fazer alterações nesta área.')
    }
})

exports.ativaDesativaAlunos = functions.https.onCall((data, context) => {
    function formataNumMatricula(num) {
        let numero = num
        numero = "00000" + numero.replace(/\D/g, '');
        numero = numero.slice(-5,-1) + numero.slice(-1);
        return numero
    }
    if (context.auth.token.master == true || context.auth.token.secretaria == true) {
        let alunos = data.alunos
        let turma = data.codTurma
        var timestamp = admin.firestore.Timestamp.now()
        if (data.modo == 'ativa') {
            async function ativaAlunos() {
                let dadosAluno
                let dadosTurma
                for (const matriculaNum in alunos) {
                    if (Object.hasOwnProperty.call(alunos, matriculaNum)) {
                        const nome = alunos[matriculaNum];
                        let matricula = formataNumMatricula(matriculaNum)
                        await admin.database().ref(`sistemaEscolar/alunosDesativados/${matricula}/dadosAluno`).once('value').then(snapshot => {
                            dadosAluno = snapshot.val()
                            console.log(dadosAluno)

                            admin.database().ref(`sistemaEscolar/alunosDesativados/${matricula}/dadosTurma`).once('value').then(snapshotTurma => {
                                dadosTurma = snapshotTurma.val()

                                admin.database().ref(`sistemaEscolar/alunos/${matricula}/`).set(dadosAluno).then(() => {
                                    admin.database().ref(`sistemaEscolar/alunosDesativados/${matricula}`).remove().then(() => {
                                        admin.database().ref(`sistemaEscolar/turmas/${turma}/alunos/${matricula}/`).set(dadosTurma).then(() => {
                                            admin.database().ref(`sistemaEscolar/alunos/${matricula}/historico`).push({dados:{dadosTurma: dadosTurma, turmaAtivacao: turma}, timestamp: timestamp, operacao: 'Reativação de aluno'}).then(() => {
                                                admin.database().ref(`sistemaEscolar/alunos/${matricula}/turmaAluno`).set(turma).then(() => {

                                                }).catch(error => {
                                                    throw new functions.https.HttpsError('unknown', error.message, error)
                                                })

                                            }).catch((error) => {
                                                throw new functions.https.HttpsError('unknown', error.message, error)
                                            })
                                        
                                        }).catch(error => {
                                            throw new functions.https.HttpsError('unknown', error.message, error)
                                        })
                                    }).catch(error => {
                                        throw new functions.https.HttpsError('unknown', error.message, error)
                                    })
                                }).catch(error => {
                                    throw new functions.https.HttpsError('unknown', error.message, error)
                                })
                            }).catch(error => {
                                throw new functions.https.HttpsError('unknown', error.message, error)
                            })
                        }).catch(error => {
                            throw new functions.https.HttpsError('unknown', error.message, error)
                        })
                    }
                }
            }

            return ativaAlunos().then(() => {
                return {answer: 'Os alunos selecionados foram reativados com sucesso.'}
            }).catch(error => {
                throw new functions.https.HttpsError('unknown', error.message, error)
            })
        } else if (data.modo == 'desativa') {
            async function desativaAlunos() {
                let dadosAluno
                let dadosTurma
                for (const matriculaNum in alunos) {
                    if (Object.hasOwnProperty.call(alunos, matriculaNum)) {
                        const nome = alunos[matriculaNum];
                        let matricula = formataNumMatricula(matriculaNum)
                        admin.database().ref(`sistemaEscolar/alunos/${matricula}`).once('value').then(snapshot => {
                            dadosAluno = snapshot.val()
                            console.log(dadosAluno)
                            turma = dadosAluno.turmaAluno
                            admin.database().ref(`sistemaEscolar/turmas/${turma}/alunos/${matricula}/`).once('value').then(snapshotTurma => {
                                dadosTurma = snapshotTurma.val()

                                admin.database().ref(`sistemaEscolar/alunosDesativados/${matricula}/`).set({dadosAluno: dadosAluno, dadosTurma: dadosTurma}).then(() => {
                                    admin.database().ref(`sistemaEscolar/alunos/${matricula}`).remove().then(() => {
                                        admin.database().ref(`sistemaEscolar/turmas/${turma}/alunos/${matricula}/`).remove().then(() => {
                                            admin.database().ref(`sistemaEscolar/alunosDesativados/${matricula}/dadosAluno/historico`).push({dados:{dadosTurma: dadosTurma, turma: turma}, timestamp: timestamp, operacao: 'Desativação de aluno'}).then(() => {

                                            }).catch((error) => {
                                                throw new functions.https.HttpsError('unknown', error.message, error)
                                            })
                                        
                                        }).catch(error => {
                                            throw new functions.https.HttpsError('unknown', error.message, error)
                                        })
                                    }).catch(error => {
                                        throw new functions.https.HttpsError('unknown', error.message, error)
                                    })
                                }).catch(error => {
                                    throw new functions.https.HttpsError('unknown', error.message, error)
                                })
                            }).catch(error => {
                                throw new functions.https.HttpsError('unknown', error.message, error)
                            })
                        }).catch(error => {
                            throw new functions.https.HttpsError('unknown', error.message, error)
                        })
                    }
                }
            }


            return desativaAlunos().then(() => {
                return {answer: 'Os alunos selecionados foram desativados com sucesso.'}
            }).catch(error => {
                throw new functions.https.HttpsError('unknown', error.message, error)
            })
            
            
        } else {
            throw new functions.https.HttpsError('aborted', 'A operação foi abortada pois não foi passado o modo da operação')
        }

    } else {
        throw new functions.https.HttpsError('permission-denied', 'Você não possui permissão para fazer alterações nesta área.')
    }
})

exports.lancarNotas = functions.https.onCall((data, context) => {
    // data: {alunos: {matricula: nomeAluno}, turma: codTurma, notas: {ativ1: 50, ativ2: 50}}
    if (context.auth.token.master == true || context.auth.token.professores == true) {
        function formataNumMatricula(num) {
            let numero = num
            numero = "00000" + numero.replace(/\D/g, '');
            numero = numero.slice(-5,-1) + numero.slice(-1);
            return numero
        }
        var dados = data
        var alunos = dados.alunos
        var turma = dados.turma
        var notas = dados.notas
    
        var alunosTurmaRef = admin.database().ref('sistemaEscolar/turmas/' + turma + '/alunos')
        async function lancar() {
            for (const matricula in alunos) {
                if (Object.hasOwnProperty.call(alunos, matricula)) {
                    const nomeAluno = alunos[matricula];
                    alunosTurmaRef.child(formataNumMatricula(matricula) + '/notas').set(notas).then(() => {
                        return admin.database().ref(`sistemaEscolar/registroGeral`).push({operacao: 'Lançamento de notas', timestamp: admin.firestore.Timestamp.now(), userCreator: context.auth.uid, dados: dados}).then(() => {
                            
                        }).catch(error => {
                            throw new functions.https.HttpsError('unknown', error.message, error)
                        })
                    }).catch(error => {
                        throw new functions.https.HttpsError('unknown', error.message, error)
                    })
                }
            }
        }
        return lancar().then(() => {
            return {answer: 'As notas lançadas com sucesso. Aguarde um momento até que o sistema atualize as notas automaticamente.'}
        }).catch(error => {
            throw new functions.https.HttpsError('unknown', error.message, error)
        })
        
    } else {
        throw new functions.https.HttpsError('permission-denied', 'Você não possui permissão para fazer alterações nesta área.')
    }

})

exports.lancaDesempenhos = functions.database.ref('sistemaEscolar/turmas/{codTurma}/alunos/{matricula}/desempenho').onWrite((snapshot, context)=> {
    // context.timestamp = context.timestamp
    // context.params = { codTurma: 'KIDS-SAT08', matricula: '00001' }

    var notasDesempenho = snapshot.after.val()
    var referencia = {turma: context.params.codTurma, matriculaAluno: context.params.matricula}

    return admin.database().ref(`sistemaEscolar/turmas/${referencia.turma}/status/turma`).once("value").then(status => {
        if(status === "aberta") {
            return admin.database().ref(`sistemaEscolar/turmas/${referencia.turma}/notas/Desempenho`).once('value').then(notasDesempenhoTurma => {
                if (notasDesempenhoTurma.exists()) {
                    let somatorioDesempenho = 0
                    for (const nomeNota in notasDesempenho) {
                        if (Object.hasOwnProperty.call(notasDesempenho, nomeNota)) {
                            const valor = notasDesempenho[nomeNota];
                            somatorioDesempenho += valor
                        }
                    }
        
                    return admin.database().ref(`sistemaEscolar/turmas/${referencia.turma}/alunos/${referencia.matriculaAluno}/notas/Desempenho`).set(somatorioDesempenho).then(() => {
                        return 'Somatório de desempenho da matricula '+ referencia.matriculaAluno + ' foi alterado na turma ' + referencia.turma
                    }).catch(error => {
                        throw new functions.https.HttpsError('unknown', error.message, error)
                    })
                } else {
                    return 'A turma ' + referencia.turma + 'não possui nota de desempenho distribuída no somatório final das notas. A nota da matricula ' + referencia.matriculaAluno + ' não foi alterada.'
                }
            }).catch(error => {
                throw new functions.https.HttpsError('unknown', error.message, error)
            })
        } else {
            throw new functions.https.HttpsError('permission-denied', 'Você só pode lançar notas em uma turma aberta')
        }
    }).catch(error => {
        throw new functions.https.HttpsError('unknown', error.message, error)
    })

    
})

exports.aberturaTurma = functions.database.ref('sistemaEscolar/turmas/{turma}/status/turma').onUpdate((snapshot, context) => {
    // context.timestamp = context.timestamp
    // context.params = { turma: "cod da turma" }
    const classId = context.params.turma
    const classState = snapshot.after.val()

    // checking if the class status is "opened"
    if (classState === "aberta") {
        
    }

})

exports.fechaTurma = functions.https.onCall((data, context) => {
    function formataNumMatricula(num) {
        let numero = num
        numero = "00000" + numero.replace(/\D/g, '');
        numero = numero.slice(-5,-1) + numero.slice(-1);
        return numero
    }
    if (context.auth.token.master == true || context.auth.token.professores == true) {
        var turma = data
        var turmaRef = admin.database().ref(`sistemaEscolar/turmas/${turma}`)
        var alunosRef = admin.database().ref(`sistemaEscolar/alunos/`)
        var chave = alunosRef.push().key
        return turmaRef.once('value').then(dadosTurma => {
            async function sequenciaDeFechamento(dadosDaTurma) {
                delete dadosDaTurma.historicoEscolar
                turmaRef.child('status/turma').set('fechada').then(()=>{

                }).catch(error => {
                    throw new Error(error.message)
                })

                let aulaEvento = (await turmaRef.child('aulaEvento').once('value')).val()

                turmaRef.child('historicoEscolar/' + chave).set({dadosDaTurma: dadosDaTurma, timestamp: admin.firestore.Timestamp.now(), codTurma: dadosDaTurma.codigoSala, aulaEvento: aulaEvento}).then(() => {

                }).catch(error => {
                    throw new Error(error.message)
                })

                turmaRef.child('frequencia').remove().then(() => {
                    
                }).catch(error => {
                    throw new Error(error.message)
                })

                for (const matricula in dadosDaTurma.alunos) {
                    if (Object.hasOwnProperty.call(dadosDaTurma.alunos, matricula)) {
                        let infoAluno = dadosDaTurma.alunos[matricula];
                        infoAluno.notasReferencia = dadosDaTurma.notas
                        infoAluno.timestamp = admin.firestore.Timestamp.now()
                        infoAluno.codigoSala = dadosDaTurma.codigoSala
                        infoAluno.inicio = dadosDaTurma.status.inicio
                        infoAluno.fim = dadosDaTurma.status.fim
                        infoAluno.qtdeAulas = dadosDaTurma.status.qtdeAulas
                        infoAluno.livros = dadosDaTurma.livros
                        infoAluno.curso = dadosDaTurma.curso
                        infoAluno.nomePeriodo = dadosDaTurma.status.nomePeriodo
                        infoAluno.professor = dadosDaTurma.professor
                        alunosRef.child(formataNumMatricula(matricula) + '/historicoEscolar/' + chave).set({infoAluno: infoAluno, timestamp: admin.firestore.Timestamp.now(), turma: dadosDaTurma.codigoSala, aulaEvento: aulaEvento}).then(() => {

                        }).catch(error => {
                            throw new Error(error.message)
                        })
                        turmaRef.child('alunos/' + formataNumMatricula(matricula)).set({nome: infoAluno.nome}).then(() => {

                        }).catch(error => {
                            throw new Error(error.message)
                        })
                    }
                }
                admin.database().ref(`sistemaEscolar/registroGeral`).push({operacao: 'Fechamento de Turma',  timestamp: admin.firestore.Timestamp.now(), userCreator: context.auth.uid, dados: {codTurma: dadosDaTurma.codigoSala}}).then(() => {
                            
                }).catch(error => {
                    throw new functions.https.HttpsError('unknown', error.message, error)
                })
                await turmaRef.child('aulaEvento').remove()
            }

            return sequenciaDeFechamento(dadosTurma.val()).then(callback => {
                return {answer: 'A sequência de fechamento da turma foi concluída com sucesso.', callback: callback}
            }).catch(error => {
                throw new functions.https.HttpsError('unknown', error.message, error)
            })
        }).catch(error => {
            throw new functions.https.HttpsError('unknown', error.message, error)
        })
    } else {
        throw new functions.https.HttpsError('permission-denied', 'Você não possui permissão para fazer alterações nesta área.')
    }
})

exports.aberturaChamados = functions.database.ref('sistemaEscolar/chamados/{key}').onCreate(async (snapshot, context) => {

    function convertTimestamp(timestamp) {
        let time = new Date(timestamp._seconds * 1000)
    
        return time;
    }

    const priorities = ['Baixa', 'Média', 'Alta', 'Crítica'];
    const emailSuporte = 'suporte@grupoprox.com'
    const key = context.params.key
    let chamado = snapshot.val()
    chamado.timestamp = admin.firestore.Timestamp.now()
    chamado.situacao = 0

    await admin.database().ref('sistemaEscolar/chamados').child(key).set(chamado)

    let imagens = ''
    try {
        if (!chamado.imagens) {
            imagens = 'O solicitante não anexou imagens ao chamado.'
        }
        for (const i in chamado.imagens) {
            if (Object.hasOwnProperty.call(chamado.imagens, i)) {
                const url = chamado.imagens[i];
                imagens += `<a href="${url}" target="_blank">Imagem ${Number(i) + 1}</a><br>`
            }
        }
    } catch (error) {
        console.log(error)
    }

    let firestoreRef = admin.firestore().collection('mail');
    let emailContent = {
        to: emailSuporte,
        cc: chamado.email,
        replyTo: emailSuporte,
        message: {
            subject: `Abertura de chamado: ${chamado.assunto}`,
            text: `Notificação de abertura de chamado no sistema escolar.`,
            html: `
            <h5>Abertura de chamado no sistema escolar</h5>
            <p> 
                <b>Assunto: </b> ${chamado.assunto}
            </p>
            <p> 
                <b>Descrição: </b> ${chamado.descricao}
            </p>
            <p> 
                <b>Usuário solicitante: </b> ${chamado.nome}
            </p>
            <p> 
                <b>Contato do solicitante: </b> ${chamado.email}
            </p>
            <p> 
                <b>Nível de prioridade: </b> ${priorities[chamado.prioridade]}
            </p>
            <p> 
                <b>Data e Hora de Abertura: </b> ${convertTimestamp(chamado.timestamp).toLocaleDateString('pt-br', {timeZone: 'America/Sao_Paulo'})} ás ${convertTimestamp(chamado.timestamp).toLocaleTimeString('pt-BR', {timeZone: 'America/Sao_Paulo'})}
            </p>
            <p><b>Imagens anexadas à solicitação: </b><br>${imagens}</p>
            <br>
            <p>Este é um e-mail gerado automaticamente pelo sistema. <b>O e-mail é direcionado para a equipe de suporte que fará a análise do chamado, sendo que, o solicitante está em cópia (Cc) nesta mensagem</b>.</p><p>Todo o contato para análise e resolução da solicitação será preferencialmente via e-mail para fins de resguardo legal, tanto por parte do solicitante, quanto por parte da empresa administradora do sistema escolar.</p><br><br><p>Sistemas GrupoProX.</p>`
        }
    }

    await firestoreRef.add(emailContent)
    console.log('Email queued for delivery.')
})

exports.montaCalendarioGeral = functions.database.ref('sistemaEscolar/turmas/{turma}/aulaEvento/').onWrite(async (snapshot, context) => {
    let turma = context.params.turma
    let aulaEvento = snapshot.after.val()
    let source = aulaEvento
    let calendarioSnapshot = await admin.database().ref('sistemaEscolar/infoEscola/calendarioGeral').once('value')
    let calendario = calendarioSnapshot.exists() ? calendarioSnapshot.val() : [source]
    if (calendarioSnapshot.exists()) {
        calendario.push(source);
    }


    await admin.database().ref('sistemaEscolar/infoEscola/calendarioGeral').set(calendario)
    
})

exports.removeCalendarios = functions.database.ref('sistemaEscolar/turmas/{turma}/aulaEvento/').onDelete(async (snapshot, context) => {
    let turma = context.params.turma
    let aulaEvento = snapshot.val()
    let calendarioSnapshot = await admin.database().ref('sistemaEscolar/infoEscola/calendarioGeral').once('value')
    let calendarioGeral = calendarioSnapshot.val()
    let calendario = calendarioGeral.filter(source => source.id !== turma)
    
    await admin.database().ref('sistemaEscolar/infoEscola/calendarioGeral').set(calendario)
    
})

exports.geraPix = functions.https.onCall((data, context) => {
    class BrCode {
        constructor(key, amount, name, reference, key_type, city) {
          this.key = key;
          this.amount = amount;
          this.name = name;
          this.reference = reference;
          this.key_type = key_type;
          this.city = city;
        }
      
        static format_text(text) {
          return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        }
      
        formated_name() {
          return this.constructor.format_text(this.name);
        }
      
        formated_city() {
          return this.constructor.format_text(this.city);
        }
      
        formated_amount() {
          return this.amount.replace(',','.').replace(' ','').replace("R$", '');
        }
      
        formated_referance() {
          return this.constructor.format_text(this.reference).replace(' ','');
        }
      
        formated_key() {
          var rkey = this.key;
          var ktype = this.key_type.toLowerCase();
      
          if (ktype == 'telefone' || ktype == 'cnpj' || ktype == "cpf") {
            rkey = rkey.replace(/\D/g,'');
          }
      
          if (ktype == "telefone") {
            rkey = "+55" + rkey
          }
      
          return rkey
        }
      
        generate_qrcp() {
        
          var emvqr = Merchant.buildEMVQR();
            
          emvqr.setPayloadFormatIndicator("01");
          emvqr.setCountryCode("BR")
          emvqr.setMerchantCategoryCode("0000");
          emvqr.setTransactionCurrency("986");
          const merchantAccountInformation = Merchant.buildMerchantAccountInformation();
          merchantAccountInformation.setGloballyUniqueIdentifier("BR.GOV.BCB.PIX");
      
          merchantAccountInformation.addPaymentNetworkSpecific("01", this.formated_key());
      
          emvqr.addMerchantAccountInformation("26", merchantAccountInformation);
      
          if (this.name) {
            emvqr.setMerchantName(this.formated_name());
          }
      
          if (this.city) {
            emvqr.setMerchantCity(this.formated_city());
          }
      
          if (this.amount && this.amount != '') {
            emvqr.setTransactionAmount(this.formated_amount());
          }
      
          const additionalDataFieldTemplate = Merchant.buildAdditionalDataFieldTemplate();
      
          if (this.reference) {
            additionalDataFieldTemplate.setReferenceLabel(this.formated_referance());
          }
          else {
            additionalDataFieldTemplate.setReferenceLabel("***");
          }
      
          emvqr.setAdditionalDataFieldTemplate(additionalDataFieldTemplate);
          let payLoadTEst = emvqr.generatePayload();
          
          return payLoadTEst;
        }
      }
      async function criaCod() {
        const dadosBasicos = (await admin.database().ref('sistemaEscolar/infoEscola/dadosBasicos').once('value')).val();
        const lineCode = new BrCode(dadosBasicos.chavePix, data.valor, dadosBasicos.nomePix, data.descricao, dadosBasicos.tipoChavePix, dadosBasicos.cidadePix);
        console.log(lineCode)
        const code = lineCode.generate_qrcp();
        console.log(code)
        const QR_CODE_SIZE = 400;
        return QRCode.toDataURL(code, {width: QR_CODE_SIZE, height: QR_CODE_SIZE})
            .then(qrcode => {
                    //console.log(qrcode)
                    return qrcode;
                })
            .catch(err => {
                console.error(err)
            })
        
      }
      return criaCod();
      
})

exports.alteracaoDados = functions.database.ref('sistemaEscolar/alunos/{matricula}/{key}').onUpdate((snapshot, context) => {
    
    log(context.params.key)
    log(context.params.matricula)
    log(snapshot.before.val())
    log(snapshot.after.val())
})

exports.systemUpdate = functions.pubsub.schedule('0 2 * * 0').timeZone('America/Sao_Paulo').onRun((context) => {
    // let aniversariantesRef = admin.database().ref('sistemaEscolar/aniversariantes')
    // let alunosRef = admin.database().ref('sistemaEscolar/alunos')
    // let alunosRef = admin.database().ref('sistemaEscolar/alunos')
    const firestoreRef = admin.firestore().collection('mail');

    const now = new Date(context.timestamp)

    const emailContent = {
        to: "gustavo.resende@grupoprox.com",
        message: {
            subject: `Job de domingo realizado`,
            text: `Veja o log do job de domingo`,
            html: `<h3>Olá!</h3><p>O Job de systemUpdate do Sistema Escolar foi executado.</p><p>Ano base: ${now.getFullYear()}</p><p> Timestamp: ${context.timestamp}</p><p> EventId: ${context.eventId}</p><p> EventType: ${context.eventType}</p><p>Sistemas ProjetoX.</p>`
        }
    }


    

    firestoreRef.add(emailContent).then(() => {
        console.log('Queued email for delivery')
    }).catch(error => {
        console.error(error)
        throw new Error(error.message)
    })

    return null;
});

exports.dailyUpdate = functions.pubsub.schedule('0 0 * * *').timeZone('America/Sao_Paulo').onRun((context) => {
    // let aniversariantesRef = admin.database().ref('sistemaEscolar/aniversariantes')
    // let alunosRef = admin.database().ref('sistemaEscolar/alunos')
    // let alunosRef = admin.database().ref('sistemaEscolar/alunos')
    const firestoreRef = admin.firestore().collection('mail');

    const now = new Date(context.timestamp)

    const ref = admin.database().ref("sistemaEscolar")

    const updates = async () => {
        let aniversaries = []
        const studentsSnap = await ref.child('alunos').once('value')
        const allStudents = studentsSnap.val()
        for (const id in allStudents) {
            if (Object.hasOwnProperty.call(allStudents, id)) {
                const student = allStudents[id];
                let timestamp = new Date(student.timestamp._seconds * 1000)
                let birthMonth = student.dataNascimentoAluno.split('-')[1]
                let month = context.timestamp.split('-')[1]
                if (birthMonth === month) {
                    aniversaries.push({name: student.nomeAluno, birthDate: student.dataNascimentoAluno, studentSince: timestamp.toLocaleDateString('pt-BR'), email: student.emailAluno, id: id})
                }
            }
        }
        const classes = (await ref.child('turmas').once('value')).numChildren();
        const disabledStudents = (await ref.child('alunosDesativados').once('value')).numChildren();
        const students = studentsSnap.numChildren();
        return {students: students, classes: classes, disabledStudents: disabledStudents, aniversaries: aniversaries};
    }

    


    updates().then(async (result) => {
        await ref.child('dadosRapidos').update(result)
        const emailContent = {
            to: "gustavo.resende@grupoprox.com",
            message: {
                subject: `Job diário realizado`,
                text: `Veja o log do job diário`,
                html: `<h3>Olá!</h3><p>O Job de dailyUpdate do Sistema Escolar foi executado.</p><p> Alunos: ${result.students}</p><p> Turmas: ${result.classes}</p><p> Alunos Desativados: ${result.disabledStudents}</p><p>Ano base: ${now.getFullYear()}</p><p> Timestamp: ${context.timestamp}</p><p> EventId: ${context.eventId}</p><p> EventType: ${context.eventType}</p><p>Sistemas ProjetoX.</p>`
            }
        }

        firestoreRef.add(emailContent).then(() => {
            console.log('Queued email for delivery')
        }).catch(error => {
            console.error(error)
            throw new Error(error.message)
        })
    }).catch((error) => {
        const emailContent = {
            to: "gustavo.resende@grupoprox.com",
            message: {
                subject: `Job diário falhou`,
                text: `Veja o log do job diário`,
                html: `<h3>Olá!</h3><p>O Job de dailyUpdate do Sistema Escolar foi executado, porém falhou.</p><p>Error message: ${error.message}</p><p>Ano base: ${now.getFullYear()}</p><p> Timestamp: ${context.timestamp}</p><p> EventId: ${context.eventId}</p><p> EventType: ${context.eventType}</p><p>Sistemas ProjetoX.</p>`
            }
        }

        firestoreRef.add(emailContent).then(() => {
            console.log('Queued email for delivery')
        }).catch(error => {
            console.error(error)
            throw new Error(error.message)
        })
    })

    

    return null;
});

exports.newYear = functions.pubsub.schedule('0 2 1 1 *').timeZone('America/Sao_Paulo').onRun((context) => {
        const firestoreRef = admin.firestore().collection('mail');

        const calendarRef = admin.database().ref("sistemaEscolar/infoEscola/calendarioGeral");
    
        const now = new Date(context.timestamp)
    
        /**
         * Example:
        [
            {
                "date": "2022-01-01",
                "name": "Confraternização mundial",
                "type": "national"
            },
            {
                "date": "2022-03-01",
                "name": "Carnaval",
                "type": "national"
            }
            ...
        ]
         * @param {string} year The year to get the holidays
         * @returns array
         * 
         * 
         */
        const getBrazilianHolidays = async (year) => {
            
            const response = await axios.get(`https://brasilapi.com.br/api/feriados/v1/${year}`)
            
            const holidays = response.data
            // const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${year}`)
            // const holidays = await response.json()
            
            
            return holidays;
        }
    
        let holidaySource = {events: [], id: 'Holidays ' + now.getFullYear(), color: '#0b8043'};
    
        getBrazilianHolidays(now.getFullYear()).then(holidays => {
            holidays.map((holiday, i) => {
                holidaySource.events.push({title: holiday.name, start: holiday.date})
            })
    
    
            calendarRef.transaction((sources) => {
                if (sources) {
                    sources.push(holidaySource)
                } else {
                    sources = [holidaySource]
                }
    
                return sources;
            }, (error) => {
                if (error) {
                    console.log(error)
                }   
            })
        }).catch(error => console.log(error))
    
        
    
    
    
        const emailContent = {
            to: "gustavo.resende@grupoprox.com",
            message: {
                subject: `Job anual realizado`,
                text: `Veja o log do job anual`,
                html: `<h3>Olá!</h3><p>O Job de newYear do Sistema Escolar foi executado.</p><p>Ano base: ${now.getFullYear()}</p><p> Timestamp: ${context.timestamp}</p><p> EventId: ${context.eventId}</p><p> EventType: ${context.eventType}</p><p>Sistemas ProjetoX.</p>`
            }
        }
    
    
        
    
        firestoreRef.add(emailContent).then(() => {
            console.log('Queued email for delivery')
        }).catch(error => {
            console.error(error)
            throw new Error(error.message)
        })
    
        return null;
})

    
exports.geraBoletos = functions.https.onCall((data, context) => {
        const getDaysInMonth = (month, year) => {
            // Here January is 1 based
            //Day 0 is the last day in the previous month
            return new Date(year, month, 0).getDate();
            // Here January is 0 based
            // return new Date(year, month+1, 0).getDate();
        };

        async function gera(matricula, codContrato) {
            let alunoRef = admin.database().ref('sistemaEscolar/alunos/' + matricula + '/')
            let alunosDesativadosRef = admin.database().ref('sistemaEscolar/alunosDesativados')
            let contratoRef = admin.database().ref('sistemaEscolar/infoEscola/contratos').child(codContrato)
            let infoEscola = await admin.database().ref('sistemaEscolar/infoEscola').once('value')
            let docsSistemaVal = await admin.database().ref('sistemaEscolar/docsBoletos').once('value')
            let dadosEscola = infoEscola.val()
            console.log(dadosEscola)
            let dadosAluno = await alunoRef.once('value')
            dadosAluno = dadosAluno.exists() ? dadosAluno : await alunosDesativadosRef.child(matricula + '/dadosAluno').once('value')
            let aluno = dadosAluno.val()
            let contratos = aluno.contratos
            let contrato = contratos[contratos.indexOf(codContrato)]
            let data = dadosEscola.contratos[codContrato].contratoConfigurado
            let plano = dadosEscola.contratos[codContrato].planoOriginal
            let mesInicio = Number(data['ano-mes'].split('-')[1])
            let anoInicio = Number(data['ano-mes'].split('-')[0])
            console.log(codContrato)
            let docsSistema = docsSistemaVal.val()
            let qtdeDocs = 0

            let timestamp = await admin.firestore.Timestamp.now()
            console.log(timestamp)
            var now = new Date(timestamp._seconds * 1000)
            console.log(now)
            var dataProcessamento = `${Number(now.getDate()) <= 9 ? '0' + now.getDate() : now.getDate()}/${Number(now.getMonth()) + 1 <= 9 ? '0' + (Number(now.getMonth()) + 1) : now.getMonth()}/${now.getFullYear()}`
            
            for (const key in docsSistema) {
                if (Object.hasOwnProperty.call(docsSistema, key)) {
                    qtdeDocs++
                    
                }
            }
            let pag = 1
            let bol = 0

            try {

                let docsBoletosGerados = await contratoRef.child('docsBoletos').once('value')
                var numerosDeDoc = docsBoletosGerados.val()
                let continuar = true
                // if (numerosDeDoc != null) {
                //     continuar = window.confirm('O sistema identificou débitos ativos para este contrato. Deseja gerar novos débitos/boletos? (Para gerar, clique em OK)')
                    
                // }

                if (continuar) {
                    data.valorDesconto = (Number(data.valorCurso) * (data.descontoPlano/100)).toFixed(2)
                    data.valorAcrescimo = (Number(data.valorCurso) * (data.acrescimoPlano/100)).toFixed(2)
                    data.valorFinal = (Number(data.valorCurso) + (data.valorAcrescimo - data.valorDesconto)).toFixed(2)
                    let saldo = data.valorCurso
                    let saldoAcrescimo = data.valorAcrescimo
                    let saldoDesconto = data.valorDesconto
                    let contadorParcelas = data.numeroParcelas
                    let somaParcelas = 0
                    let valorParcelaGlobal = 0
                    let mesParcela
                    let numDoc = qtdeDocs + 1
                    let numerosDeDoc = []

                    for (let parcela = 0; parcela < data.numeroParcelas; parcela++) {
                        let valorParcela
                        let valorCobrado
                        let acrescimoParcela = 0
                        let descontoParcela = 0
                        numerosDeDoc.push(numDoc)
                        if (plano.distribuirAcrescimosEDescontos == 'on') {
                            
                            
                            
                            
                            if (parcela == 0) { 
                                valorParcelaGlobal = parseFloat(saldo / contadorParcelas).toFixed(2) 
                            } 
                            if (parcela >= plano.quandoAplicar) {
                                // parcela == data.quandoAplicar ? saldo = data.valorFinal - somaParcelas : null
                                if (parcela == plano.quandoAplicar) {
                                    valorParcelaGlobal = parseFloat(saldo / contadorParcelas).toFixed(2)
                                }
                                
                                valorParcela = valorParcelaGlobal
                                acrescimoParcela = (saldoAcrescimo/contadorParcelas).toFixed(2)
                                descontoParcela = (saldoDesconto/contadorParcelas).toFixed(2)
                                // saldo = (Number(saldo) - valorParcela) - Number(acrescimoParcela - descontoParcela)
                            } else {
                                valorParcela = valorParcelaGlobal
                                
                                // saldo = saldo - valorParcela
                                acrescimoParcela = 0
                                descontoParcela = 0
                            }
                            
                            saldoAcrescimo = saldoAcrescimo - acrescimoParcela
                            saldoDesconto = saldoDesconto - descontoParcela
                            
                            valorCobrado = (Number(valorParcela) + (acrescimoParcela - descontoParcela)).toFixed(2)
                            somaParcelas += (Number(valorParcela) + (acrescimoParcela - descontoParcela))
                        } else {
                            if (parcela === 0) {
                                saldo = data.valorFinal
                            }

                            valorCobrado = parseFloat(data.valorFinal / data.numeroParcelas).toFixed(2)
                            valorParcela = valorCobrado
                            // saldo = saldo - parseFloat(data.valorFinal / data.numeroMaximoParcelasPlano).toFixed(2)
                            somaParcelas += Number(parseFloat(data.valorFinal / data.numeroParcelas))
                        }
                        saldo = (parcela >= plano.quandoAplicar ? data.valorFinal : data.valorCurso) - somaParcelas
                        console.log(saldo)
                        mesParcela = mesInicio + parcela
                        if ((mesInicio + parcela) > 12) {
                            mesParcela = mesParcela - 12
                        }
                        if (mesParcela === 1 && parcela !== 0) {
                            anoInicio++
                        }
                        let proximoDiaVencimento = dadosEscola.dadosBasicos.proximoDiaVencimento === 'true' ? true : false
                        let diaVencimento = data.vencimentoEscolhido
                        let mesVencimento = mesParcela
                        let anoVencimento = anoInicio
                        if (getDaysInMonth(mesParcela, anoInicio) < data.vencimentoEscolhido) {
                            if (proximoDiaVencimento) {
                                diaVencimento = 1
                                mesVencimento = mesParcela === 12 ? 1 : mesParcela + 1
                                anoVencimento = mesVencimento === 1 && parcela !== 0 ? anoInicio + 1 : anoInicio
                            } else {
                                diaVencimento = getDaysInMonth(mesParcela, anoInicio)
                            }
                        }
                        
                        
                        await addParcela(parcela + 1, data.numeroParcelas, `${diaVencimento <= 9 ? '0' + diaVencimento : diaVencimento}/${mesVencimento <= 9 ? '0' + mesVencimento : mesVencimento}/${anoVencimento}`, numDoc, valorParcela, descontoParcela, acrescimoParcela, valorCobrado, dataProcessamento, )
                        // addParcela(`Saldo: R$${saldo}`)
                        contadorParcelas--
                        numDoc++
                        
                    }

                    contratoRef.child('docsBoletos').set(numerosDeDoc).then(() => {
                        console.log('Docs Cadastrados')
                    }).catch(error => {
                        console.log('Erro', error.message)
                    })
                } 
                

                

            } catch (error) {
                console.log(error)
            }

            
            
            async function addParcela(parcelaAtual, numDeParcelas, vencimento, numeroDoc, valorDoc, descontos, acrescimos, totalCobrado, dataProcessamento, informacoes) {
                
                bol++
                if (bol > 3 && pag >= 1) {
                    pag++
                    bol = 0
                    // document.getElementById('livro').innerHTML += `
                    // <div class="page">
                    //     <div class="subpage">
                    //         <div id="boletos${pag}"></div>
                    //     </div>
                    // </div>
                    // `
                }
                //let boletos = document.getElementById('boletos' + pag)
                await admin.database().ref('sistemaEscolar').child('docsBoletos').push({
                    numeroDoc: numeroDoc,
                    valorDoc: valorDoc,
                    vencimento: vencimento,
                    parcelaAtual: parcelaAtual,
                    numDeParcelas: numDeParcelas,
                    descontos: descontos,
                    acrescimos: acrescimos,
                    totalCobrado: totalCobrado,
                    dataProcessamento: dataProcessamento,
                    informacoes: data.descricaoPlano,
                    codContrato: codContrato,
                    matricula: matricula  
                })
                
                //let gera = firebase.functions().httpsCallable('geraPix')
                // return gera({valor: totalCobrado, descricao: `DOC${numeroDoc}`}).then(function(lineCode) {
                
                    
                //     //divQr.src = lineCode.data;
                //     console.log(lineCode)
                //     //const code = new QRCode(divQr, { text: lineCode.data, width: 100, height: 100 });
                //     //qrCodesArray.push({qrcode: lineCode.data, numeroDoc: numeroDoc})
                //     boletos.innerHTML += `
                //     <table style="height: 241px; width: 100%; border-collapse: collapse; border-style: solid; margin-top: 18px;" border="1" >
                //     <tbody>
                //         <tr style="height: 10px; border-style: none;">
                //             <td style="width: 4.97079%; height: 179px;" rowspan="9">&nbsp;</td>
                //             <td style="width: 22.9045%; height: 20px; text-align: center;" rowspan="2">
                //             <table style="height: 100%; width: 96.3454%; border-collapse: collapse; border-style: hidden;" border="1">
                //             <tbody>
                //             <tr style="height: 18px;">
                //                 <td style="width: 38.8889%; height: 33px;" rowspan="2"><img src="${dadosEscola.logoEscola}" alt="Logo" width="30" height="30" /></td>
                //                 <td style="width: 189.264%; height: 18px; border-left: hidden;">
                //                     <section style="font-size: 8pt; text-align: center;">
                //                         Parcela
                //                     </section>
                                    
                //                     <section style="font-size: x-small; text-align: center;">
                //                         ${parcelaAtual}/${numDeParcelas}
                //                     </section>
                //                 </td>
                //             </tr>
                //             <tr style="height: 15px;">
                //             <td style="width: 189.264%; height: 15px; border-left: hidden;">
                //                     <section style="font-size: 8pt; text-align: center;">
                //                         Vencimento
                //                     </section>
                                    
                //                     <section style="font-size: x-small; text-align: center;">
                //                         ${vencimento}
                //                     </section>
                //             </td>
                //         </tr>
                //         </tbody>
                //         </table>
                //         </td>
                //         <td style="width: 7.60226%; text-align: center; height: 20px; border-left: dotted;" rowspan="2"><img src="${dadosEscola.logoEscola}" alt="Logo" width="30" height="30" /></td>
                //         <td style="height: 20px; width: 43.8475%;" colspan="3" rowspan="2">
                //             <section style="font-size: 8pt;">
                //                 &nbsp;<b>Cedente</b>
                //             </section>
                //             <section style="font-size: x-small;">
                //                 &nbsp;${dadosEscola.dadosBasicos.nomeEscola}
                //             </section>
                //             <section style="font-size: x-small;">
                //                 &nbsp;${dadosEscola.dadosBasicos.cnpjEscola}
                //             </section>
                //             <section style="font-size: x-small;">
                //                 &nbsp;${dadosEscola.dadosBasicos.enderecoEscola}
                //             </section>
                //             <section style="font-size: x-small;">
                //                 &nbsp;${dadosEscola.dadosBasicos.telefoneEscola}
                //             </section>
                //         </td>
                //         <td style="width: 64.5223%; height: 10px; text-align: center;">
                //             <section style="font-size: 8pt;">
                //                 Parcela
                //             </section>
                            
                //             <section style="font-size: x-small; text-align: center;">
                //                 ${parcelaAtual}/${numDeParcelas}
                //             </section>    
                //         </td>
                //         </tr>
                //         <tr style="height: 10px;">
                //         <td style="width: 64.5223%; height: 10px;">
                //             <section style="font-size: 8pt; text-align: center;">
                //                 Vencimento
                //             </section>
                            
                //             <section style="font-size: x-small; text-align: center;">
                //                 ${vencimento}
                //             </section>    
                //         </td>
                //         </tr>
                //         <tr style="height: 33px;">
                //         <td style="width: 22.9045%; height: 33px; text-align: start;">
                //             <section style="font-size: 8pt; text-align: center;">
                //                 Documento
                //             </section>
                            
                //             <section style="font-size: x-small; width: 100%; text-align: center;">
                //                 ${numeroDoc}
                //             </section>    
                //         </td>
                //         <td style="width: 19.286%; height: 33px; border-left: dotted;" colspan="2">
                //             <section style="font-size: 8pt; text-align: center;">
                //                 Documento
                //             </section>
                            
                //             <section style="font-size: x-small; width: 100%; text-align: center;">
                //                 ${numeroDoc}
                //             </section>        
                //         </td>
                //         <td style="width: 14.2301%; height: 33px;">
                //             <section style="font-size: 8pt; text-align: center;">
                //                 Espécie
                //             </section>
                            
                //             <section style="font-size: x-small; width: 100%; text-align: center;">
                //                 R$
                //             </section>        
                //         </td>
                //         <td style="width: 17.9337%; height: 33px;">
                //             <section style="font-size: 8pt; text-align: center;">
                //                 Processamento
                //             </section>
                            
                //             <section style="font-size: x-small; text-align: center;">
                //                 ${dataProcessamento}
                //             </section>    
                //         </td>
                //         <td style="width: 64.5223%; height: 33px;">
                //             <section style="font-size: 8pt; text-align: center;">
                //                 (=) Valor do documento
                //             </section>
                            
                //             <section style="font-size: x-small; width: 100%; text-align: center;">
                //                 R$${valorDoc}
                //             </section>        
                //         </td>
                //         </tr>
                //         <tr style="height: 24px;">
                //         <td style="width: 22.9045%; height: 24px;">
                //             <section style="font-size: 8pt; text-align: center;">
                //                 (=) Valor do documento
                //             </section>
                            
                //             <section style="font-size: x-small; width: 100%; text-align: center;">
                //                 R$${valorDoc}
                //             </section>          
                //         </td>
                //         <td style="width: 51.4498%; height: 88px; border-left: dotted;" colspan="3" rowspan="4">
                //             <section style="font-size: 8pt;">
                //                 &nbsp;Informações
                //             </section>
                            
                //             <section style="font-size: x-small;">
                //                 &nbsp;${data.nomeCursoAdd}
                //             </section>
                            
                            
                //         <p style="font-size: x-small; width: 100%; text-align: start;">&nbsp;${data.descricaoPlano}</p>
                //         </td>
                //         <td style="width: 17.9337%; height: 88px;" rowspan="4" colspan="1">
                //             <section style="font-size: 8pt; text-align: center;">
                //                 Pague via PIX
                //             </section>
                //             <section style="font-size: 8pt; text-align: center;">
                //                 <img id="qrcode${numeroDoc}" style="width: 80px;" src="${lineCode.data}">
                //             </section>
                            
                               
                //         </td>
                //         <td style="width: 64.5223%; height: 24px;">
                //             <section style="font-size: 8pt; text-align: center;">
                //                 (-) Descontos
                //             </section>
                            
                //             <section style="font-size: x-small; width: 100%; text-align: center;">
                //                 ${descontos}
                //             </section>          
                //         </td>
                //         </tr>
                //         <tr style="height: 22px;">
                //             <td style="width: 22.9045%; height: 22px;">
                //                 <section style="font-size: 8pt; text-align: center;">
                //                     (-) Descontos
                //                 </section>
                                
                //                 <section style="font-size: x-small; width: 100%; text-align: center;">
                //                     R$${descontos}
                //                 </section>    
                //             </td>
                //             <td style="width: 64.5223%; height: 22px;">
                //                 <section style="font-size: 8pt; text-align: center;">
                //                     (+) Acréscimos
                //                 </section>
                                
                //                 <section style="font-size: x-small; width: 100%; text-align: center;">
                //                     R$${acrescimos}
                //                 </section>    
                //             </td>
                //         </tr>
                //         <tr style="height: 21px;">
                //             <td style="width: 22.9045%; height: 21px;">
                //                 <section style="font-size: 8pt; text-align: center;">
                //                     (+) Acréscimos
                //                 </section>
                                
                //                 <section style="font-size: x-small; width: 100%; text-align: center;">
                //                     R$${acrescimos}
                //                 </section>     
                //             </td>
                //             <td style="width: 64.5223%; height: 21px;">
                //                 <section style="font-size: 8pt; text-align: center;">
                //                     (=) Total Cobrado
                //                 </section>
                                
                //                 <section style="font-size: x-small; width: 100%; text-align: center;">
                //                     R$${totalCobrado}
                //                 </section>     
                //             </td>
                //         </tr>
                //         <tr style="height: 21px;">
                //             <td style="width: 22.9045%; height: 21px;">
                //                 <section style="font-size: 8pt; text-align: center;">
                //                     (=) Total Cobrado
                //                 </section>
                                
                //                 <section style="font-size: x-small; width: 100%; text-align: center;">
                //                     R$${totalCobrado}
                //                 </section>    
                //             </td>
                //             <td style="width: 64.5223%; height: 21px;">
                //                 <section style="font-size: 8pt; text-align: center;">
                //                     Data de Pagamento:
                //                 </section>
                                
                //                 <section style="font-size: small; width: 100%; text-align: center;">
                //                     ____/____/______
                //                 </section>
                //             </td>
                //         </tr>
                //         <tr style="height: 20px;">
                //             <td style="width: 22.9045%; height: 20px;" rowspan="2">
                //                 <section style="font-size: 8pt; text-align: center;">
                //                     Data de Pagamento:
                //                 </section>
                                
                //                 <section style="font-size: small; width: 100%; text-align: center;">
                //                     ____/____/______
                //                 </section>    
                //             </td>
                //             <td style="width: 51.4498%; height: 38px; border-left: dotted;" colspan="4" rowspan="2">
                //                 <section style="font-size: 8pt;">
                //                     &nbsp;<b>Sacado</b>
                //                 </section>
                                
                //                 <section style="font-size: x-small;">
                //                     &nbsp;${aluno.nomeAluno}&nbsp;&nbsp;&nbsp; CPF Nº: ${aluno.cpfAluno}<br>
                //                     &nbsp;${aluno.enderecoAluno}, ${aluno.numeroAluno}, ${aluno.bairroAluno}, ${aluno.cidadeAluno}-${aluno.estadoAluno}
                //                 </section>    
                //             </td>
                //             <td style="width: 64.5223%; height: 38px;" rowspan="2">
                //                 <section style="font-size: 8pt; text-align: center;">
                //                     Assinatura:
                //                 </section>
                                
                //                 <section style="font-size: small; width: 100%; text-align: center;">
                //                    &nbsp;
                //                 </section>    
                //             </td>
                //         </tr>
                //     </tbody>
                //     </table>
                //     ` 
                //     return ;
                // })
                
            }

            return numerosDeDoc;

        }

        return gera(data.matricula, data.codContrato).then((numerosDeDoc) => {
            return numerosDeDoc;
        }).catch(error => {
            throw new functions.https.HttpsError('unknown', error.message, error)
        })
})

exports.escutaBoletos = functions.database.ref('sistemaEscolar/docsBoletos/{docKey}').onCreate((snapshot, context) => {
    console.log(context.params)
    console.log(snapshot.after)
    console.log(context.timestamp)
    const docKey = context.params.docKey
    const doc = snapshot.val();
    if (doc.status !== undefined) {
        admin.database().ref('sistemaEscolar/docsBoletos').child(docKey).child('status').set(0)
        console.log(`Doc ${doc.numeroDoc} key ${docKey}. Status setado para 0`)
    }

    
})

exports.escutaHistoricoBoletos = functions.database.ref('sistemaEscolar/docsBoletos/{docKey}/historico/{histKey}').onCreate((snapshot, context) => {
    /**
     * For the WriteOff, 0 = Pending, 1 = Waiting approval, 2 = Written Off, 3 = Challenge, 4 = Canceled
     * 0 means that the billet has not been paid or has not received a write off. In other words, is pending a write off.
     * 1 means that some user with less privilegies in the system changed the status of the billet, then it needs to be approved by one that has the required privilegies
     * 2 means that the billet have been paid, and the Write Off is approved and effective.
     * 3 means that some user has encountered some inconsistency related to that billet and needs review.
     * 4 means that this billet has been canceled for some reason and will not be charged.
     */
     const billetStatus = [
        'Pendente',
        'Aguardando aprovação',
        'Baixa efetuada',
        'Contestado',
        'Cancelado'
    ];
    const docKey = context.params.docKey
    const histKey = context.params.histKey
    const hist = snapshot.val()
    const userRequester = hist.userCreator

    console.log(hist)

    const start = async () => {
        if (hist.status !== undefined) {
            const user = await admin.auth().getUser(userRequester)
            const userAccess = user.customClaims
            
            if (userAccess.master === true || userAccess.adm === true) {
                await admin.database().ref('sistemaEscolar/docsBoletos').child(docKey).child('status').set(hist.status)
                await admin.database().ref('sistemaEscolar/docsBoletos').child(docKey).child('historico').child(histKey).child('approver').set(userRequester)
                await admin.database().ref('sistemaEscolar/docsBoletos').child(docKey).child('historico').child(histKey).child('comments').push({text: `(Comentário automático do sistema) O usuário ${user.displayName} (${user.email}) modificou o status deste documento para "${billetStatus[hist.status]}".`, timestamp: context.timestamp})
                if (hist.paidValue !== undefined && hist.paymentDay !== undefined) {
                    await admin.database().ref('sistemaEscolar/docsBoletos').child(docKey).child('valorPago').set(hist.paidValue)
                    await admin.database().ref('sistemaEscolar/docsBoletos').child(docKey).child('dataDePagamento').set(hist.paymentDay)
                }
                
                await admin.database().ref('sistemaEscolar/billetsNotifications').push({title: 'Mudança de status no boleto', text: 'O boleto abaixo teve seu status modificado', docKey: docKey, histKey: histKey, userCreator: userRequester, timestamp: context.timestamp})
            } else {
                await admin.database().ref('sistemaEscolar/docsBoletos').child(docKey).child('status').set(1)
                
                await admin.database().ref('sistemaEscolar/docsBoletos').child(docKey).child('historico').child(histKey).child('comments').push({text: `(Comentário automático do sistema) O usuário ${user.displayName} (${user.email}) deseja modificar o status deste documento para "${billetStatus[hist.status]}" e necessita de aprovação.`, timestamp: context.timestamp})
                await admin.database().ref('sistemaEscolar/billetsNotifications').push({title: 'Mudança de status boleto', text: 'O boleto abaixo teve seu status modificado', docKey: docKey, histKey: histKey, userCreator: userRequester, timestamp: context.timestamp})
            }
        }
        
        
    }
    

    //admin.database().ref('sistemaEscolar/billetsNotifications').child(docKey).child()
    start()
})

exports.escutaContratos = functions.database.ref('sistemaEscolar/infoEscola/contratos/{key}').onCreate((snapshot, context) => {
    const setContract = async () => {
        const key = context.params.key
        const studentId = snapshot.child('matricula').val()
        console.log(studentId)
        await admin.database().ref('sistemaEscolar/infoEscola/contratos').child(key).child('status').set(0)
        await admin.database().ref('sistemaEscolar/infoEscola/contratos').child(key).child('timestamp').set(admin.firestore.Timestamp.now())
        const snap = await admin.database().ref('sistemaEscolar/alunos').child(studentId).child('contratos').once('value')
        if (snap.exists()) {
            let contracts = snap.val()
            
            let message
            if (contracts.indexOf(key) === -1) {
                contracts.push(key)
                await admin.database().ref('sistemaEscolar/alunos').child(studentId).child('contratos').set(contracts)
                message = ' e eu coloquei mais um'
            }
            return 'Já tinha contrato no aluno' + message
        } else {
            await admin.database().ref('sistemaEscolar/alunos').child(studentId).child('contratos').set([key])
            return 'Estava sem nada no aluno'
        }
            
    
        
    }
    
    return setContract().then(result => {
        console.log('Deu certo.', result)
        return 'Deu certo';
    })

})

exports.lancaFaltas = functions.https.onCall((data, context) => {
    // const data = {dateStr: dateStr, classId: classId, studentsIds: studentsIds}
    const classId = data.classId
    const studentsIds = data.studentsIds
    const dateStr = data.dateStr
    let studentsObj = {}
    for (const i in studentsIds) {
        if (Object.hasOwnProperty.call(studentsIds, i)) {
            const id = studentsIds[i];
            studentsObj[id] = id
        }
    }

    const release = async () => {
        const classRef = admin.database().ref('sistemaEscolar/turmas/' + classId);
        const checkStr = await classRef.child("frequencia").child(dateStr).once("value")
        if (checkStr.exists()) {
            throw new Error('Já existem faltas lançadas para este dia. Para lançar faltas novamente, apague as faltas já lançadas.')
        } else {
            await classRef.child("frequencia").child(dateStr).set(studentsObj);
            for (const i in studentsIds) {
                if (Object.hasOwnProperty.call(studentsIds, i)) {
                    const id = studentsIds[i];
                    await classRef.child('alunos').child(id).child('frequencia').child(dateStr).set({turma: classId})
                }
            }
            
            return data;
        }
        
        
    }

    return release().then(result => {
        return {answer: "Faltas lançadas com sucesso.", result: result}
    }).catch(error => {
        throw new functions.https.HttpsError('unknown', error.message, error)
    })

})

exports.removeFaltas = functions.https.onCall((data, context) => {
    // const data = {dateStr: dateStr, classId: classId, studentId: studentId}
    const classId = data.classId
    const studentId = data.studentId
    const dateStr = data.dateStr
    

    const release = async () => {
        const classRef = admin.database().ref('sistemaEscolar/turmas/' + classId);
        await classRef.child("frequencia").child(dateStr).child(studentId).remove();
        await classRef.child('alunos').child(studentId).child('frequencia').child(dateStr).remove();
        
        return data;
    }

    return release().then(result => {
        return {answer: "Faltas removidas com sucesso.", result: result}
    }).catch(error => {
        throw new functions.https.HttpsError('unknown', error.message, error)
    })

})

exports.escutaFollowUp = functions.database.ref('sistemaEscolar/followUp/{id}').onCreate((snapshot, context) => {
    const setContract = async () => {
        const key = context.params.id
        const studentId = snapshot.child('matricula').val()
        await admin.database().ref('sistemaEscolar/followUp').child(key).child('timestamp').set(admin.firestore.Timestamp.now())
        
    }
    
    return setContract().then(result => {
        console.log('Deu certo.', result)
        return 'Deu certo';
    })
})

// exports.adicionaFotoAluno = functions.storage.object().onFinalize(async (object) => {
//     const fileBucket = object.bucket; // The Storage bucket that contains the file.
//     const filePath = object.name; // File path in the bucket.
//     const contentType = object.contentType; // File content type.
//     const metageneration = object.metageneration; // Number of times metadata has been generated. New objects have a value of 1.
//     const metadata = object.metadata; // File metadata.
//     // Exit if this is triggered on a file that is not an image.
//     log(fileBucket)
//     log(filePath);
//     log(path.dirname(filePath));
    
//     if (!contentType.startsWith('image/') && filePath.indexOf('alunos') == -1) {
//         return log('This is not an image.');
        
//     }
//     // Get the file name.
//     log("URL: ", url);
//     const fileName = path.basename(filePath);
//     const matricula = path.dirname(filePath).split('/')[2];
//     log(matricula);
//     return admin.database().ref(`sistemaEscolar/alunos/${matricula}/fotoAluno`).set(url).then(() => {
//         log("Foto adicionada com sucesso!");
//         return {
//             answer: 'Foto adicionada com sucesso.'
//         }
//     }).catch(error => {
//         log(error);
//     })

    
// })

//Functions for chat app

// exports.chatListener = functions.database.instance('chatchat-7d3bc').ref('chats').onCreate(async (snapshot, context) => {
    
//     const chat = snapshot.val();
//     const chatKey = chat.chatKey;

//     await admin.database('https://chatchat-7d3bc.firebaseio.com/').ref('chats').child(chatKey + '/createdAt').set(context.timestamp)
    

    
//     const settingsRef = admin.database('https://chatchat-7d3bc.firebaseio.com/').ref('settings')

//     const settings = (await settingsRef.once('value')).val()

//     if (settings.sendEmail) {
//         const now = new Date(context.timestamp)
//         const emailContent = {
//             to: 'chat@grupoprox.com',
//             cco: settings.emails,
//             message: {
//                 subject: `Novo Chat pendente`,
//                 text: `${chat.name.split(' ')[0]} está esperando ser atendido.`,
//                 html: `<h3>${chat.name.split(' ')[0]} está esperando ser atendido.</h3><p>Informações coletadas já coletadas:</p><p>Nome: ${chat.name}</p><p> Criado em: ${now.toLocaleDateString()}</p><p>Sistemas GrupoProX.</p>`
//             }
//         }

//         const firestoreRef = admin.firestore().collection('mail');
//         firestoreRef.add(emailContent).then(() => {
//             console.log('Queued email for delivery to gustavo@resende.app')
//         }).catch(error => {
//             console.error(error)
//             throw new Error(error.message)
//         })
//     }

    

    

// })