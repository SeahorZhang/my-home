import DefaultTheme from "vitepress/theme";
import Home from "./Home.vue";
import "./custom.css";

const MineTheme = {
  extends: DefaultTheme,
  Layout: Home,
};

export default MineTheme;