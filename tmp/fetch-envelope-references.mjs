import fs from 'node:fs/promises';
await fs.mkdir('tmp/envelope-references',{recursive:true});
for(const id of ['1030128114792652755','799107527677409599','694539573836819935','614248836723945387']) {
 const html=await fs.readFile(`tmp/envelope-references/${id}.html`,'utf8');
 const tag=html.match(/<meta[^>]*property="og:image"[^>]*>/)?.[0];
 const url=tag?.match(/content="([^"]+)/)?.[1];
 console.log(id,url||'No image metadata');
 if(url){const img=await fetch(url.replaceAll('&amp;','&'));await fs.writeFile(`tmp/envelope-references/${id}.jpg`,Buffer.from(await img.arrayBuffer()));}
}
