import {React, Component} from "react";

import Base from "components/main/Base";

const visibleStack = []

export default class FloatPanelBase extends Base {
  constructor(props) {
    super(props);
    require.ensure(['../public/js/jquery'], () => {
      const $ = require('../public/js/jquery')
      $("body").on("click", (e) => {
        let t = $(e.target);
        let visible = false
        if (t.closest(".float-detail-wrap").length) {
          visible = true
        }
        if (t.closest(".showfloat").length) {
          // return;
          visible = true
        }
        if (t.closest("[role=customerName]").length) {
          // return;
          visible = true
        }
        if (t.closest("[role=floatPane]").length) {
          // return;
          visible = true
        }
        if (!visible) {
          setTimeout(() => {
            if (this.state.visible) {
              this.hide();
            }
          });
        }
      });
    })

  }

  hide() {
    // this.setState({visible: false, data: null});
    console.log('visibleStack')
    const lastFloatPanel = visibleStack.pop()
    console.log('lastFloatPanel',lastFloatPanel)
    if(lastFloatPanel){
      lastFloatPanel.setState({visible: false, data: null})
    }
  }

  visible(visible = true) {
    if (!window.APP.state.collapsed) {
      window
        .APP
        .toggle()
    }
    visibleStack.push(this)
    console.log('visible',visible)
    console.log('visibleStack',visibleStack)
    this.setState({visible: visible})
  }
}
