import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('APIManager')
export class APIManager extends Component {

    // public static urlAPI: string = APIManager.urlParam(`url_api_stu`) || "https://apiwordpuzzle-mytel.elsapro.net";
    public static urlAPI: string = APIManager.urlParam(`url_api`) || "https://apiwordpuzzle-mytel.elsapro.net";
    // public static urlAPI: string = "http://192.168.1.151:3098";
    // public static sessionID;
    public static userDATA: {
        id?: number;
        username?: string;
        [key: string]: any; // Cho phép thêm thuộc tính động nếu cần
    } = {};
    public static GID = Number(APIManager.urlParam(`gid`)) || 0;

    public static requestData(method: string, key: string, data: any, callBack: (response: any) => void) {
        const url = this.urlAPI + key;

        APIManager.CallRequest(method, data, url, (response) => {
            callBack(response);
        }, (xhr) => {
            xhr.setRequestHeader('Authorization', 'Bearer ' + APIManager.urlParam(`token`));
            xhr.setRequestHeader("Content-type", "application/json");
        });
    }

    public static CallRequest(method, data, url, callback, callbackHeader) {
        let param = this;
        var xhr = new XMLHttpRequest();

        xhr.onerror = () => {
        };

        xhr.ontimeout = () => {
        }

        xhr.onabort = () => {
        }

        xhr.onloadend = () => {
        }

        xhr.onreadystatechange = () => {
            if (xhr.readyState != 4) return;
            if (xhr.status == 200 && xhr.responseText) {
                var response = JSON.parse(xhr.responseText);
                console.log(`Call.${method}=>`, url, "\n", response);
                callback(response);
            }
            else {
                response = JSON.parse(xhr.responseText);
                response.status = xhr.status;
                callback(null);
            }
        };
        xhr.open(method, url, true);
        callbackHeader(xhr);
        let body
        if (data != null)
            body = JSON.stringify(data);
        else
            body = data
        xhr.send(body);
    }

    public static urlParam(name) {
        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.search);
        // var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec("/?gid=3296&url_stu=https://studio.lingox.co&url_api_stu=https://api-st.lingox.co&url_api=https://api-beta.lingox.co&publish=true");
        return (results !== null) ? results[1] || 0 : false;
    }
}


