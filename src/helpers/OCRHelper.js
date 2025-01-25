//put your key here.
//this endpoint will tell Google to use the Vision API. We are passing in our key as well.
const apiKey = process.env.EXPO_PUBLIC_API_KEY
const API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
function generateBody(image) {
  const body = {
    "requests":[
      {
        "image":{
          "content":image
        },
        "features":[
          {
            "type":"TEXT_DETECTION",
            "maxResults":1
          }
        ]
      }
    ]
  };
  return body;
}



async function callGoogleVisionAsync(base64Image) {
       
    const body = generateBody(base64Image); //pass in our image for the payload
    console.log(API_URL)
    //console.log(base64Image)
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    const detectedText = result.responses[0].fullTextAnnotation;
    return detectedText   ? detectedText   : { text: "This image doesn't contain any text!" };
  }
  export default callGoogleVisionAsync;