import inlineStyles from "../../styles/inlineStyles.js";
function Logo() {
  return (
    <div>
      <img
        src="./assets/imgs/logo-data-divers.svg"
        alt="Data Divers"
        style={inlineStyles("logo")}
        width={280}
      />
    </div>
  );
}

export default Logo;
