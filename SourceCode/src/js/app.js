App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
  
      try {
          await window.ethereum.enable();
      } catch (error) {
          console.error("User denied account access");
      }
    }
    else if (window.web3) {
        App.web3Provider = window.web3.currentProvider;
    }
    else {
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Verification.json', function(data) {
      var VerificationArtifact = data;
      App.contracts.Verification = TruffleContract(VerificationArtifact);
      App.contracts.Verification.setProvider(App.web3Provider);
      return App.markVerify();
  });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-verify', App.handleVerify);
    $(document).on('click', '.btn-result', App.getResult);
    $(document).on('click', '.btn-return', App.init);
  },

  markVerify: function() {
    var verificationInstance;
    App.contracts.Verification.deployed().then(function(instance) {
      verificationInstance = instance;
      return verificationInstance.getVerifiers.call();
    }).then(function(verifiers) {
      $.getJSON('../painting.json', function(data) {
        var paintingCell = $('#paintingCell');
        var paintingTemplate = $('#paintingTemplate');
        paintingCell.empty();
        
        for (i = 0; i < verifiers.length; i++) {
          if (verifiers[i] == '0x0000000000000000000000000000000000000000') {
            paintingTemplate.find('img').attr('src', data[i].picture);
            paintingTemplate.find('.btn-verify').attr('data-id', data[i].id);
            paintingCell.append(paintingTemplate.html());
          }
        }

        $('.text-center').text('Danh sách tranh cần chứng thực');
      });
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handleVerify: function(event) {
    event.preventDefault();

    var id = parseInt($(event.target).data('id'));

    var verificationInstance;
    
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
        
      var account = accounts[0];

      App.contracts.Verification.deployed().then(function(instance) {
        verificationInstance = instance;
        $.getJSON('../verifier.json', function(data) {
          var flag = false;
          for (i = 0; i < data.length; i++) {
            if (account == data[i].address.toLowerCase()) {
              flag = true;
              break;
            }
          }

          if (flag) {
            // const fs = require("fs");
            // var data = fs.readFileSync('../transaction.json');
            // var object = JSON.parse(data);
            // let newData = {
            //   "paintingId": id,
            //   "verifierId": account
            // }
            // object.push(newData);
            // newData = JSON.stringify(newData);
            // fs.writeFile('../transaction.json', newData, err => {});
            return verificationInstance.verify(id, 16, { from: account });
          } else {
            alert("Bạn không có quyền chứng thực cho bức tranh này");
          }
        })
      }).then(function(result) {
        return App.markVerify();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  getResult: function() {
    var verificationInstance;
    App.contracts.Verification.deployed().then(function(instance) {
      verificationInstance = instance;
      return verificationInstance.getVerifiers.call();
    }).then(function(verifiers) {
      $.getJSON('../painting.json', function(data) {
        $.getJSON('../verifier.json', function (verifier) {
          var paintingCell = $('#paintingCell');
          paintingCell.empty();
          var paintingTemplate = $('#paintingTemplate');
          var verifiedPainting = new Array(verifiers.length);
          var index = 0;
          var verifierName;
          
          for (i = 0; i < verifiers.length; i++) {
            if (verifiers[i] !== '0x0000000000000000000000000000000000000000') {
              paintingTemplate.find('img').attr('src', data[i].picture);
              paintingTemplate.find('.btn-verify').attr('data-id', data[i].id);
              paintingCell.append(paintingTemplate.html());
              verifiedPainting[index++] = i + 1;
            }
          }
            
          for(i = 0; i < index; i++)
          {
            for (j = 0; j < verifier.length; j++) {
              if (verifiers[verifiedPainting[i] - 1] == verifier[j].address.toLowerCase()) {
                verifierName = verifier[j].name;
              }
            }
            $('.panel-pet').eq(i).find('button').text('Đã chứng thực bởi ' + verifierName)
              .attr('disabled', true);
            $('.panel-pet').eq(i).find('button').attr('style', 'margin-left: -5.5%;');
          }

          $('.text-center').text('Danh sách tranh đã chứng thực');
        });
    }).catch(function(err) {
      console.log(err.message);
    });
  });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
