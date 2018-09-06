// @author Rob W <http://stackoverflow.com/users/938089/rob-w>
// Demo: var serialized_html = DOMtoString(document);

function adicionaLista(produtos){
  chrome.storage.local.get(['produtos_chinashopping'], function(items) {
    if(items.produtos_chinashopping){

      var arrProdutos;

      arrProdutos = produtos;

      chrome.storage.local.set({'produtos_chinashopping': JSON.stringify(arrProdutos)}, function() {
            console.log('Os dados Foram Salvos');
          });

      return arrProdutos;

    } else {
      var arrProdutos = new Array();
      arrProdutos = produtos;

      chrome.storage.local.set({'produtos_chinashopping': JSON.stringify(arrProdutos)}, function() {
          console.log('Os dados Foram Salvos Pela primeira vez.');

        });
        return arrProdutos;
    }

  });

}

function isPreco(dado){
  var patt = /\d*.\d*,\d*/;

  if(patt.test(dado)){
    return dado;
  } else {
    return null;
  }
}

function isCod(dado){

  if(dado.indexOf("cod:") > -1){
    return dado.split("cod: ")[1];
  } else {
    return null;
  }
}

function isMedidas(str){
  var arrString = str.split(" ");
  var arrMedidas = [];
  var medidas = {
    altura:       null,
    largura:      null,
    comprimento:  null,
  };

  for (var i = 0; i < arrString.length; i++) {
    if (arrString[i].indexOf("X") > -1) {
      arrMedidas = arrString[i].split("X");
      medidas.altura = arrMedidas[0];
      if(arrMedidas.length < 3){
        medidas.largura = arrMedidas[1];
        medidas.comprimento = arrMedidas[1];
      } else {
        medidas.largura = arrMedidas[1];
        medidas.comprimento = arrMedidas[2];
      }
    }
  }

  return medidas;
}

function DOMtoString(document_root) {

    //Captura todos os Nodes de produtos do album
    var arrFotos = document_root.getElementsByClassName('box-cada-produto');

    var arrProdutos = [];

    for(var i = 0; i < arrFotos.length; i++){
      // Objeto que receberá os dados dos produtos
      var produto = {
        cod           :   null,
        nome          :   null,
        preco         :   null,
        preco_de      :   null,
        medidas       :   {altura: null, largura: null, comprimento: null},
        url_foto     :   null,
      };

      // Capturando o link da foto
      var link_foto = arrFotos[i].children[0].src;

      produto.url_foto = link_foto;

      // Capturando linha com dados do produtos

      var arrDados = arrFotos[i].innerText.trim().split("\n");


      for(var j = 0; j < arrDados.length; j++){
        var preco = isPreco(arrDados[j]);

        var cod = isCod(arrDados[j]);

        if(preco != null){
          produto.preco = preco;
        }

        if(cod != null){
          produto.cod = cod;
        }

        var medidas = isMedidas(arrDados[0]);
        if(medidas.altura || medidas.largura || medidas.comprimento || medidas.diametro){
          if(medidas.altura){
            produto.medidas.altura = medidas.altura;
          } else {
            produto.medidas.altura = null;
          }

          if(medidas.largura){
            produto.medidas.largura = medidas.largura;
          } else {
            produto.medidas.largura = null;
          }

          if(medidas.comprimento){
            produto.medidas.comprimento = medidas.comprimento;
          } else {
            produto.medidas.comprimento = null;
          }
        }
      }

      arrProdutos.push(produto);

    }
    console.log(arrProdutos);
    var jsonProdutos = adicionaLista(arrProdutos);

    return produto;
}

chrome.runtime.sendMessage({
    action: "getSource",
    source: DOMtoString(document)
});
