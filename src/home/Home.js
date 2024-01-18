import { Container } from "@material-ui/core";

const Home = () => {
    return (
        <Container>
            <h2>Bem-vindo ao sistema escolar.</h2>
            <p>Este é um projeto em desenvolvimento. Qualquer dúvida, envie um e-mail para <a href="mailto:gustavo@resende.app">gustavo@resende.app</a></p>
            <p style={{color: "red"}}>Este é um ambiente de desenvolvimento, não cadastre informações pessoais aqui.</p>
            <p>Utilize as ferramentas do site 4devs.com.br para criar informações fictícias para testar o sistema.</p>
        </Container>
    );
}
 
export default Home;