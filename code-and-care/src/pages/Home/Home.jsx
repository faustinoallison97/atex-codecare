import style from "./Home.module.css";
import ImgSegundaTela from "../../assets/img-tela-2.avif";
import { FiMapPin } from "react-icons/fi";
import { LuUsers } from "react-icons/lu";
import { FaRegHeart } from "react-icons/fa6";
import { MdOutlineArrowRightAlt } from "react-icons/md";
import Topbar from "../../components/Topbar/Topbar";
import { useNavigate } from "react-router";

function Home() {
  const navigate = useNavigate();

  function navegarParaMapaRotas() {
    navigate("/mapa-rotas");
  }
  return (
    <>
      <Topbar />
      <div className={style.container_conteudo_total}>
        <div id="sessao1" className={style.container_conteudo_primeira_tela}>
          <h1>Vamos mudar vidas juntos!</h1>
          <p>
            Acompanhe e participe das nossas rotas de entrega de doações.
            Juntos, fazemos a diferença!
          </p>

          <div className={style.container_botoes_primeira_tela}>
            <button
              onClick={navegarParaMapaRotas}
              className={style.botao_rotas}
            >
              Vizualizar Rotas
            </button>
            <button className={style.botao_saiba_mais}>Saiba Mais</button>
          </div>
        </div>

        <div id="sessao2" className={style.container_segunda_tela}>
          <div className={style.container_info_sefunda_tela}>
            <button className={style.botao_sobre_projeto}>
              Sobre o Projeto
            </button>
            <h2>Conectando doadores e voluntários</h2>
            <p>
              ATEX - Code & Care foi criado para facilitar a visualização e
              organização das rotas de entrega de doações, tornando o processo
              mais acessível e eficiente para voluntários e doadores. Nosso
              objetivo é proporcionar uma experiência intuitiva, permitindo que
              qualquer pessoa acompanhe, em tempo real, as rotas das entregas e
              os pontos de doação. Com o auxílio do Google Maps, garantimos mais
              transparência e praticidade, conectando quem deseja ajudar a quem
              precisa. Quer fazer a diferença? Acompanhe as entregas ou junte-se
              como voluntário!
            </p>
          </div>
          <img
            className={style.imagem_segunda_tela}
            src={ImgSegundaTela}
            alt="Descrição"
          />
        </div>

        <div id="sessao3" className={style.container_terceira_tela}>
          <div className={style.container_info_terceira_tela}>
            <button className={style.botao_como_funciona}>Como Funciona</button>
            <h2>Três passos simples para fazer a diferença</h2>
            <p>
              Nosso processo é simples e eficiente, permitindo que você
              acompanhe e participe de forma transparente.
            </p>
          </div>

          <div className={style.container_cards_terceira_tela}>
            <div className={style.container_card_terceira_tela}>
              <FiMapPin id={style.icone_rotas} />
              <h3>Veja as rotas</h3>
              <p>
                Acompanhe em tempo real as nossas rotas de entrega pelo mapa
                interativo. Saiba exatamente onde as doações estão sendo
                entregues e como está o progresso.
              </p>
              <a href="" id={style.primeiro_link_redirecionar}>
                Ver mapa <MdOutlineArrowRightAlt />
              </a>
            </div>
            <div className={style.container_card_terceira_tela}>
              <LuUsers id={style.icone_pessoas} />
              <h3>Participe das entregas</h3>
              <p>
                Seja um voluntário e ajude diretamente no processo de entrega.
                Você pode se inscrever para participar de rotas específicas ou
                se tornar um voluntário regular.
              </p>
              <a href="" id={style.segundo_link_redirecionar}>
                Ser voluntário <MdOutlineArrowRightAlt />
              </a>
            </div>
            <div className={style.container_card_terceira_tela}>
              <FaRegHeart id={style.icone_coracao} />
              <h3>Faça a diferença</h3>
              <p>
                Suas ações ajudam famílias. Cada doação, cada hora de
                voluntariado, cada compartilhamento faz uma grande diferença na
                vida de quem precisa.
              </p>
              <a href="" id={style.terceiro_link_redirecionar}>
                Ver impacto <MdOutlineArrowRightAlt />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
