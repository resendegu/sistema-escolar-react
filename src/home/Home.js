const Home = () => {
    return (
        <div>
            <h1>Seja bem vindo ao Sistema Escolar!</h1>
            <p>{window.location.hostname === 'escola.resende.app' && 'Esté é uma ambiente de desenvolvimento, e pode ser instável. Não recomendamos inserir informações sensíveis neste ambiente.'}</p>
        </div>
    );
}
 
export default Home;