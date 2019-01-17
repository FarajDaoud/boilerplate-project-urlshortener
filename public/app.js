document.addEventListener('DOMContentLoaded', () => {
  
  document.getElementById('submitURL').addEventListener('click', () => {
    getShortUrl();
  });
  
  //on document ready get short url for example.com
  getShortUrl();
});

function getShortUrl(){
    let url = 'https://farajdaoud-url-shortener.glitch.me/api/shorturl/new';
    let data = `userURL=${document.getElementById('urlUserInput').value}`;
    fetch(url, {
        method: "POST",
         headers: {
          'Content-Type':'application/x-www-form-urlencoded'
        },
        body: data,
    })
    .then((res) => res.json())
    .then((data) => {
        console.log(`Server Response: ${JSON.stringify(data)}`);
        if(data.shortUrl !== undefined){
          document.getElementById('linkContainer').style.display = "block";
          document.getElementById('clickContainer').style.display = "block";
          document.getElementById('invalidURL').style.display = "none";
          document.getElementById('result').innerHTML = 'https://farajdaoud-url-shortener.glitch.me/api/shorturl/' + data.shortUrl;
          document.getElementById('result').href = 'https://farajdaoud-url-shortener.glitch.me/api/shorturl/' + data.shortUrl;
          document.getElementById('clicks').innerHTML = JSON.stringify(data.clicks);
        }
        else{
          document.getElementById('linkContainer').style.display = "none";
          document.getElementById('clickContainer').style.display = "none";
          document.getElementById('invalidURL').style.display = "block";
          document.getElementById('result').innerHTML = '';
          document.getElementById('result').href = ''
          document.getElementById('clicks').innerHTML = '';
        }
    })
    .catch(error => console.error('Error:', error)); 
  }
