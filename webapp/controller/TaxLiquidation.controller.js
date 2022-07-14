sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "./BaseController",
    "sap/ui/model/odata/v2/ODataModel",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel, MessageToast, BaseController, ODataModel) {
    "use strict";

    return BaseController.extend(
      "tax.provisioning.computations.controller.TaxLiquidation",
      {
        onInit: function () {
          sap.ui.getCore().sapAppID = this.getOwnerComponent()
            .getMetadata()
            .getManifest()["sap.app"].id;
          this.getOwnerComponent()
            .getRouter()
            .getRoute("TaxLiquidation")
            .attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
          var oEvent = oEvent.getParameter("arguments");
          var computationID = oEvent.ID;
          var imposta = oEvent.imposta;
          var dataTestata = { computationID: computationID, imposta: imposta };
          var DataModelTestata = new JSONModel(dataTestata);
          this.getView().setModel(DataModelTestata, "oModelTestata");

          this._setRedditoImponibile();
          this._setRitenute();
          this._setCredito();
          this._setVersamenti();
          this._setImpostaCredito();
        },

        _setRedditoImponibile: function(){
            var computationID = this.getView().getModel("oModelTestata").getData().computationID;
            var imposta = this.getView().getModel("oModelTestata").getData().imposta;
            var that = this;
            jQuery.ajax({
                url: jQuery.sap.getModulePath(
                  sap.ui.getCore().sapAppID +
                    "/catalog/KPITotRipresaView?$filter=computationId eq " +
                    computationID +
                    " and imposta eq '" +
                    imposta +
                    "'"
                ),
                contentType: "application/json",
                type: "GET",
                dataType: "json",
                async: false,
                success: function (oCompleteEntry) {
                    var fRedditoImponibile = oCompleteEntry.value[0].redditoImponibile;
                    var sDescrizioneReddito = that.getResourceBundle().getText("descrReddito");
                    var percentuale = null;
                    var descrizioneImposta = that.getResourceBundle().getText("descrImpostaNetta");

                    var oImposta = [{
                         descrizione: descrizioneImposta,
                         percentualeNetta: 0,
                         redditoImponibile: 0
                    }];

                    var data = [{descrizione : sDescrizioneReddito, percentualeNetta: percentuale, redditoImponibile: fRedditoImponibile}];
                    data.push(oImposta[0]);
                    
                    var oModel = new JSONModel(data);
                    that.getView().setModel(oModel, "oModelRedditoImponibile");

                    that._setPercRegion();
                },
                error: function (error) {
                  sap.m.MessageToast.show("Error");
                }
            });
        },

        _setPercRegion: function(){
            var computationID = this.getView().getModel("oModelTestata").getData().computationID;
            var imposta = this.getView().getModel("oModelTestata").getData().imposta;
            var that = this;
            jQuery.ajax({
                url: jQuery.sap.getModulePath(
                  sap.ui.getCore().sapAppID +
                    "/catalog/RegionsAVGView?$filter=computazioneID eq " +
                    computationID +
                    " and imposta eq '" +
                    imposta +
                    "'"
                ),
                contentType: "application/json",
                type: "GET",
                dataType: "json",
                async: false,
                success: function (oCompleteEntry) {


                    var oModel = that.getView().getModel("oModelRedditoImponibile");
                    var data = oModel.getData();
                    var oImposta = that.getView().getModel("oModelRedditoImponibile").getData()[
                        data.length - 1
                    ];

                  var percImpostaNetta = oCompleteEntry.value[0].currentAvg;
                  var fRedditoImponibile = data[0].redditoImponibile;
                  var sdescrImpostaNetta = that.getResourceBundle().getText("descrImpostaNetta");
                  var ftotImportoPerc = percImpostaNetta * fRedditoImponibile;

                  oImposta = {
                    descrizione: sdescrImpostaNetta,
                    percentualeNetta: percImpostaNetta + "%",
                    redditoImponibile: ftotImportoPerc
                  }

                  oModel.getData()[data.length - 1] = oImposta;
                  oModel.refresh();
                },
                error: function (error) {
                  sap.m.MessageToast.show("Error");
                },
            });
        },

        _setRitenute: function(){

            // jQuery.ajax({
            //     url: jQuery.sap.getModulePath(
            //       sap.ui.getCore().sapAppID +
            //         "/catalog/TaxLiquidation"
            //     ),
            //     contentType: "application/json",
            //     type: "GET",
            //     dataType: "json",
            //     async: false,
            //     success: function (oCompleteEntry) {
                  
            //     },
            //     error: function (error) {
            //       sap.m.MessageToast.show("Error");
            //     }
            // });

            var sDescrRitenute = this.getResourceBundle().getText("descrRitenute");
            var sDescrCrediti = this.getResourceBundle().getText("sDescrCrediti");
            var sDetrazioni = this.getResourceBundle().getText("sDetrazioni");

            var sImpostaDovuta = this.getResourceBundle().getText("sImpostaDovuta");
            var oImpostaDovuta = [{
                descrizione: sImpostaDovuta
            }]
            var descrizioni = [{descrizione: sDescrRitenute}, {descrizione: sDescrCrediti}, {descrizione: sDetrazioni}];
            descrizioni.push(oImpostaDovuta[0])

            var oModel = new JSONModel(descrizioni);
            this.getView().setModel(oModel, "oModelRitenute");
        },

        _setCredito: function(){
            var computationID = this.getView().getModel("oModelTestata").getData().computationID;
            var imposta = this.getView().getModel("oModelTestata").getData().imposta;
            var that = this;
            jQuery.ajax({
                url: jQuery.sap.getModulePath(
                  sap.ui.getCore().sapAppID +
                    "/catalog/TaxPaymentsView(imposta='" +
                    imposta +
                    "',computationId=" +
                    computationID +
                    ")/Set"
                ),
                contentType: "application/json",
                type: "GET",
                dataType: "json",
                async: false,
                success: function (oCompleteEntry) {
                  var data = oCompleteEntry.value;

                  var V = data.filter((importo) => importo.tipologia === "V");
                  var AM = data.filter((importo) => importo.tipologia === "AM");
                  var C = data.filter((importo) => importo.tipologia === "C");

                  var sCreditoPrecedente = that.getResourceBundle().getText("sCreditoPrecedente");
                  var sCreditoAcquisito = that.getResourceBundle().getText("sCreditoAcquisito");
                  var sCreditoPrecInComp = that.getResourceBundle().getText("sCreditoPrecInComp");
                  var sCreditoPrecUtil = that.getResourceBundle().getText("sCreditoPrecUtil");

                  var oCreditoPrec = [{
                    importo: V[0].Importo,
                    descrizione: sCreditoPrecedente                      
                  }];

                  var oCreditoAcquisito = {
                    importo: AM[0].Importo,
                    descrizione: sCreditoAcquisito
                  };

                  var oCreditoPrecComp = {
                    importo: C[0].Importo,
                    descrizione: sCreditoPrecInComp
                  };

                  var oCreditoPrecUtil = {
                      importo : V[0].Importo + AM[0].Importo + C[0].Importo,
                      descrizione: sCreditoPrecUtil
                  }

                  oCreditoPrec.push(oCreditoAcquisito, oCreditoPrecComp, oCreditoPrecUtil);

                  var oModel = new JSONModel(oCreditoPrec);
                  that.getView().setModel(oModel, "oModelCredito");
                },
                error: function (error) {
                  sap.m.MessageToast.show("Error");
                },
              });
        },

        _setVersamenti: function(){
            var computationID = this.getView().getModel("oModelTestata").getData().computationID;
            var imposta = this.getView().getModel("oModelTestata").getData().imposta;
            var that = this;
            jQuery.ajax({
                url: jQuery.sap.getModulePath(
                  sap.ui.getCore().sapAppID +
                    "/catalog/TaxPaymentsView(imposta='" +
                    imposta +
                    "',computationId=" +
                    computationID +
                    ")/Set"
                ),
                contentType: "application/json",
                type: "GET",
                dataType: "json",
                async: false,
                success: function (oCompleteEntry) {
                  var data = oCompleteEntry.value;

                  var A = data.filter((importo) => importo.tipologia === "A");

                  var sVersamenti = that.getResourceBundle().getText("sVersamenti");

                  var oVersamenti = [{
                    importo: A[0].Importo,
                    descrizione: sVersamenti                      
                  }];

                  var oModel = new JSONModel(oVersamenti);
                  that.getView().setModel(oModel, "oModelVersamenti");
                },
                error: function (error) {
                  sap.m.MessageToast.show("Error");
                },
              });
        },

        _setImpostaCredito: function(){
            var sImpostaCredito = this.getResourceBundle().getText("sImpostaCredito");
            var modelloCredito = this.getView().getModel("oModelCredito").getData();
            var modelloVersamenti = this.getView().getModel("oModelVersamenti").getData();
            var importoCreditoUtil = modelloCredito.filter((credito) => credito.descrizione === this.getResourceBundle().getText("sCreditoPrecUtil"))[0].importo;
            var importoVersamenti = modelloVersamenti[0].importo;

            var oImpostaCredito = [{
                descrizione: sImpostaCredito,
                importo: importoVersamenti + importoCreditoUtil                
            }];

            var oModel = new JSONModel(oImpostaCredito);
            this.getView().setModel(oModel, "oModelImpostaCredito");
        }
      }
    );
  }
);
