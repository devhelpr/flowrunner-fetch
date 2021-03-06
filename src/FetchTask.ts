import fetch from 'cross-fetch';
import * as Promise from 'promise';
import { FlowTask, FlowTaskPackageType } from '@devhelpr/flowrunner';

const getPayload = (node: any, data: any) => {
  const propertyName = node.propertyName || 'data';
  let payload;
  if (!!node.insertResultDirectIntoPayload) {
    if (node.useChildProperty) {
      payload = Object.assign({}, node.payload, { ...data[node.useChildProperty] });
    } else {
      payload = Object.assign({}, node.payload, { ...data });
    }
  } else if (node.useChildProperty) {
    payload = Object.assign({}, node.payload, { [propertyName]: data[node.useChildProperty] });
  } else {
    payload = Object.assign({}, node.payload, { [propertyName]: data });
  }
  return payload;
};

export class FetchTask extends FlowTask {
  public execute(node: any, services: any) {
    let cleanPayload = Object.assign({}, node.payload);
    cleanPayload.response = undefined;
    cleanPayload.request = undefined;

    let url = this.replacePropertiesInUrl(node.url, cleanPayload);

    return new Promise((resolve, reject) => {
      if (url != '') {
        if (node.method === undefined || node.method == '' || node.method == 'get') {
          fetch(url, {
            headers: {
              'Cache-Control': 'no-cache',
            },
          })
            .then(res => {
              if (res.status >= 400) {
                throw new Error(res.status.toString());
              }
              return res.json();
            })
            .then(data => {
              resolve(getPayload(node, data));
            })
            .catch(err => {
              console.error(err);
              node.payload = Object.assign({}, node.payload, {
                followFlow: 'isError',
              });
              resolve(node.payload);
            });
        } else {
          fetch(url, {
            method: node.method.toUpperCase(),
            body: JSON.stringify(cleanPayload),
            headers: {
              'Content-Type': 'application/json',
            },
          })
            .then(res => {
              if (res.status >= 400) {
                throw new Error(res.status.toString());
              }
              return res.json();
            })
            .then(data => {
              resolve(getPayload(node, data));
            })
            .catch(err => {
              console.error(node.method, err);
              node.payload = Object.assign({}, node.payload, {
                followFlow: 'isError',
              });
              resolve(node.payload);
            });
        }
      } else {
        reject();
      }
    });
  }

  replacePropertiesInUrl = (url: string, data: any) => {
    // parse {} from url and replace with predefined variabels
    var regularExpressionForMatchingCurlyBrackets = /{([^}]+)}/g,
      currentMatch;

    while ((currentMatch = regularExpressionForMatchingCurlyBrackets.exec(url))) {
      let value = '';
      let field = currentMatch[1];
      if (data[field]) {
        value = data[field];
      } else {
        value = '';
      }
      url = url.replace('{' + currentMatch[1] + '}', value);
    }
    return url;
  };

  public getDescription() {
    return 'Node that fetches data from an url';
  }

  public getName() {
    return 'FetchTask';
  }

  public getFullName() {
    return 'Fetch';
  }

  public getIcon() {
    return 'fetch';
  }

  public getShape() {
    return 'rect';
  }

  public getDefaultColor() {
    return '#00ff80ff';
  }

  public getTaskType() {
    return 'both';
  }

  public getPackageType() {
    return FlowTaskPackageType.DEFAULT_NODE;
  }

  public getCategory() {
    return 'FlowCanvas';
  }

  public getController() {
    return 'FlowCanvasController';
  }

  public getConfigMetaData() {
    return [
      { name: 'url', defaultValue: '', valueType: 'string', required: true },
      {
        name: 'method',
        defaultValue: 'get',
        valueType: 'enum',
        enumValues: ['get', 'post', 'delete', 'put'],
        enumText: ['get', 'post', 'delete', 'put'],
      },
    ];
  }
}
