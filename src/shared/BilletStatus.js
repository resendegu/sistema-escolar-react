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

const billetColors = [
    '#f2bb13',
    'blue',
    'green',
    'red',
    'grey'
]

const billetStatusExplanations = [
    `O status "${billetStatus[0]}" significa que este boleto ainda não foi pago ou ainda não foi efetuada sua baixa no sistema. Em outras palavras, o boleto está pendente de baixa.`,
    `O status "${billetStatus[1]}" significa que este boleto sofreu alguma mudança que requer aprovação. Normalmente acontece quando um usuário com poucos privilégios de sistema, efetua uma mudança de status em um boleto. Portanto, este boleto está aguardando aprovação da área competente.`,
    `O status "${billetStatus[2]}" significa que este boleto teve sua baixa no sistema aprovada e efetuada. A parcela foi quitada.`,
    `O status "${billetStatus[3]}" significa que algum usuário do sistema encontrou algum problema ou inconsistência no boleto e contestou/reportou este problema pelo sistema. Quando o boleto se encontra nesse status, a área competente é notificada para analisar a contestação.`,
    `O status "${billetStatus[4]}" significa que o boleto foi cancelado e desconsiderado, portanto não possui mais valor e nem poderá voltar a ter valor. Ele continuará no sistema exclusivamente para fins de consulta. Não é possível realizar qualquer outra ação com o mesmo.`,
]

export { billetStatus, billetColors, billetStatusExplanations };