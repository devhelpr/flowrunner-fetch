import fetch from 'cross-fetch';
import * as Promise from 'promise';
import { FlowTask, FlowTaskPackageType } from '@devhelpr/flowrunner';

export class FetchTask extends FlowTask {
  public execute(node: any, services: any) {
    
    let cleanPayload = Object.assign({},node.payload);
		cleanPayload.response = undefined;
		cleanPayload.request = undefined;

    let url = node.url;
    /*
		if (node.url !== undefined && node.url != "") {
			let urlTemplate = Handlebars.compile(node.url);
			url = urlTemplate(cleanPayload);
    }
    */

		return new Promise((resolve,reject) => {
			if (url != "") {
				if (node.method === undefined || node.method == "" || node.method == "get") {
          
          fetch(url)
          .then(res => {
            if (res.status >= 400) {
              throw new Error(res.status.toString());
            }
            return res.json();
          })
          .then(data => {
            let payload = Object.assign({},node.payload,{data:data});
						resolve(payload);	
          })
          .catch(err => {
            console.error(err);
            reject();
          });
                    
				} if (node.method == "post") {
                  
          fetch(url, {
              method: "POST",
              body: JSON.stringify(cleanPayload),
              headers: {
                "Content-Type": "application/json"
              }
          })
          .then(res => {
            if (res.status >= 400) {
              throw new Error(res.status.toString());
            }
            return res.json();
          })
          .then(data => {
            let payload = Object.assign({},node.payload,{data:data});
						resolve(payload);	
          })
          .catch(err => {
            console.error(node.method, err);
            reject();
          });					
				}
			} else {
				reject();
			}
		})
  }

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
			{name:"url", defaultValue:"", valueType:"string", required: true},
			{name:"method", defaultValue:"get", valueType:"enum",
				enumValues:["get","post","delete","put"],
				enumText:["get","post","delete","put"]
			},
		]  }
}
