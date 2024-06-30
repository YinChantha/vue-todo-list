import { createApp, DirectiveBinding } from "vue";
import "./style.css";
import App from "./App.vue";
import { Icon } from "@iconify/vue";
import tippy, { Instance, Props } from "tippy.js";
import "tippy.js/dist/tippy.css";

// Define the type for the directive element
interface TippyElement extends HTMLElement {
  _tippy?: Instance<Props>;
}

// Create the global tooltip directive
const tooltipDirective = {
  mounted(el: TippyElement, binding: DirectiveBinding) {
    tippy(el, {
      content: binding.value,
      placement: "top",
      animation: "shift-away",
    });
  },
  updated(el: TippyElement, binding: DirectiveBinding) {
    if (el._tippy) {
      el._tippy.setContent(binding.value);
    }
  },
};

const app = createApp(App);

// Register the directive globally
app.directive("tooltip", tooltipDirective);

app.component("Icon", Icon);
app.mount("#app");
