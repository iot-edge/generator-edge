import template from './index.html';

export class AppConfigCtrl {
  /** @ngInject */
  constructor($scope, $injector, $q) {
    this.$q = $q;
  }
}

AppConfigCtrl.template = template;
export { AppConfigCtrl as ConfigCtrl };
