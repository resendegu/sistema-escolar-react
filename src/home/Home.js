import { Container } from "@material-ui/core";

const Home = () => {
    return (
        <div>
            <Container>
                <h1>Seja bem vindo!</h1>
                <p style={{color: 'red'}}>{(window.location.hostname === 'escola.resende.app' || 'localhost' || 'school.grupoprox.com') && 'Este é um ambiente de desenvolvimento, e pode ser instável. Não recomendamos inserir informações sensíveis neste ambiente.'}</p>
                <h3>A página inicial ainda está em desenvolvimento, caso queira testar o sistema, entre em contato no e-mail ti@grupoprox.com</h3>
                <h4>Estamos em fase de desenvolvimento do sistema, e não temos uma data de lançamento ainda.</h4>
            </Container>
            
        </div>
    );
}
 
export default Home;