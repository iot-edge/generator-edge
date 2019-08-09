import template from './index.html';

export class ${ctrlName} {
  /** @ngInject */
  constructor($scope, $injector, $q) {
    this.$q = $q;
  }
}

${ctrlName}.template = template;
