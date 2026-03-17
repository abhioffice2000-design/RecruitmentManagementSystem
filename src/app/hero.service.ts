import { Injectable } from '@angular/core';
 
declare var $: any;
 
@Injectable({
  providedIn: 'root',
})
export class HeroService {
 
  constructor() { }
 
  /**
   * Converts XML/SOAP response data into a JSON object using the Cordys utility.
   * @param resp The XML/SOAP response object from a Cordys AJAX call.
   * @param key The element tag name to find and extract as JSON (e.g., 'ScreenAccess').
   * @returns The extracted JSON object.
   */
  xmltojson(resp: any, key: any) {
    return $.cordys.json.find(resp, key);
  }
 
  /**
   * Executes a Cordys SOAP request and returns a Promise.
   * Note: The original requirement uses 'dataType: "* json"', which is unusual;
   * typically it would be 'xml' or 'json', but the code is implemented exactly as requested.
   * @param method The name of the SOAP method or the full XML body.
   * @param namespace The SOAP namespace (e.g., "http://schemas.cordys.com/...")
   * @param parameters The parameters object for the SOAP call.
   * @returns A Promise that resolves with the response or rejects/resolves with the error details.
   */
  ajax(method: any, namespace: any, parameters: any) {
    return new Promise((rev, rej) => {
      // Check if $.cordys.ajax is available
      if (typeof $.cordys === 'undefined' || typeof $.cordys.ajax === 'undefined') {
        // If the library isn't loaded, resolve immediately with a descriptive error
        rev({
          status: 'Error',
          errorText: 'Cordys AJAX library is not loaded.',
        });
        return;
      }
 
      $.cordys.ajax({
        method: method,
        namespace: namespace,
        dataType: '* json', // Implemented exactly as per your requirement
        parameters: parameters,
        success: function success(resp: any) {
          rev(resp); // Resolve the Promise on success
        },
        error: function error(e1: any, e2: any, e3: any) {
          console.log('err=>', e1, e2, e3);
          // Resolve with error details (as requested in the original code)
          rev([e1, e2, e3]);
        },
      });
    });
  }
}