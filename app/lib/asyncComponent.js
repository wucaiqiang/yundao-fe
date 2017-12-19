import React from "react";

function asyncComponent(chunkName, getComponent) {
  return class AsyncComponent extends React.Component {
    static Component = null;

    static loadComponent() {
      return getComponent().then(m => m.default).then(Component => {
        AsyncComponent.Component = Component;
        return Component;
      });
    }

    mounted = false;

    state = {
      Component: AsyncComponent.Component
    };

    componentWillMount() {
      NProgress.start();
      if (this.state.Component === null) {
        AsyncComponent.loadComponent().then(Component => {

          if (this.mounted) {
            this.setState({ Component });
            window.update_message && window.update_message()
            NProgress.done();
          }
        });
      }
    }

    componentDidMount() {
      NProgress.done();
      // window.update_message && window.update_message()
      this.mounted = true;
    }

    componentWillUnmount() {
      this.mounted = false;
    }

    render() {
      const { Component } = this.state;

      if (Component !== null) {
        return <Component {...this.props} />;
      }
      return null; // or <div /> with a loading spinner, etc..
    }
  };
}

export default asyncComponent;
