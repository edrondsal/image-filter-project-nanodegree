import { Router, Request, Response } from 'express';
import {filterImageFromURL, deleteLocalFiles} from '../../../util/util';

const router: Router = Router();


/**
 * @description Function that transform the sendFile method of Response to a promise based 
 * @since   0.0.1
 * @access  private
 * @param   {Response}  response
 * @returns {Promise<string>}  response containing the string path
*/
async function promiseSendFile(response:Response,path:string): Promise<string> {
  return new Promise( (resolve,reject) => {
      response.sendFile(path, (error) =>{
          if(error){
            reject(error);
          }else{
            resolve(path);
          }
      });
  });
}
/**
 * @description Function that validates url with regex (From stakoverflow question id#5717093)
 * @since   0.0.1
 * @access  private
 * @param   {string} url - the url to test
 * @returns {boolean}  true when the url is correctly validated
*/
function validateURL(url:string):boolean {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(url);
}

// Filter image endpoint
router.get('/', async (req: Request, res: Response) => {
    const imageUrl:string = req.query.image_url as string;

    let responseError:object = {
      success: false,
      status: 422,
      type: "about:blank",
      title: 'Wrong request',
      detail: 'Request must contains a valid URL as image_url query parameter',
      instance: "about:blank"
    }

    if (!validateURL(imageUrl)){
      res.status(422).send(responseError);
    }else {

      filterImageFromURL(imageUrl)
      .then(path => promiseSendFile(res,path))
      .then( path => deleteLocalFiles([path]) )
      .catch( error => res.status(500).send('Internal Server Error'));

    }


});

export const ImageFilterRouter: Router = router;