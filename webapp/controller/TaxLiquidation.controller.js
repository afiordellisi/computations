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

          if (imposta === "IRES") {
            this._setRedditoImponibile();
            this._getRitenute();
            this._setCredito();
            this._setVersamenti();
            this._setImpostaCredito();
          } else {
            this._setTaxRates();
            this._setCredito();
            this._setVersamenti();
            this._setImpostaCredito();
          }
        },

        _setRedditoImponibile: function () {
          var computationID = this.getView().getModel("oModelTestata").getData()
            .computationID;
          var imposta = this.getView().getModel("oModelTestata").getData()
            .imposta;
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
              var fRedditoImponibile =
                oCompleteEntry.value[0].redditoImponibile;
              var sDescrizioneReddito = that
                .getResourceBundle()
                .getText("descrReddito");
              var percentuale = null;
              var descrizioneImposta = that
                .getResourceBundle()
                .getText("descrImpostaNetta");

              var oImposta = [
                {
                  descrizione: descrizioneImposta,
                  percentualeNetta: 0,
                  redditoImponibile: 0,
                },
              ];

              var data = [
                {
                  descrizione: sDescrizioneReddito,
                  percentualeNetta: percentuale,
                  redditoImponibile: fRedditoImponibile,
                },
              ];
              data.push(oImposta[0]);

              var oModel = new JSONModel(data);
              that.getView().setModel(oModel, "oModelRedditoImponibile");

              that._setPercRegion();
            },
            error: function (error) {
              sap.m.MessageToast.show("Error");
            },
          });
        },

        _setPercRegion: function () {
          var computationID = this.getView().getModel("oModelTestata").getData()
            .computationID;
          var imposta = this.getView().getModel("oModelTestata").getData()
            .imposta;
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
              var oImposta = that
                .getView()
                .getModel("oModelRedditoImponibile")
                .getData()[data.length - 1];

              var percImpostaNetta = oCompleteEntry.value[0].currentAvg;
              var fRedditoImponibile = data[0].redditoImponibile;
              var sdescrImpostaNetta = that
                .getResourceBundle()
                .getText("descrImpostaNetta");
              var ftotImportoPerc = -(
                (percImpostaNetta * fRedditoImponibile) /
                100
              );

              oImposta = {
                descrizione: sdescrImpostaNetta,
                percentualeNetta: percImpostaNetta + "%",
                redditoImponibile: ftotImportoPerc,
              };

              oModel.getData()[data.length - 1] = oImposta;
              oModel.refresh();
            },
            error: function (error) {
              sap.m.MessageToast.show("Error");
            },
          });
        },

        _getRitenute: function () {
          var computationID = this.getView().getModel("oModelTestata").getData()
            .computationID;
          var that = this;

          jQuery.ajax({
            url: jQuery.sap.getModulePath(
              sap.ui.getCore().sapAppID +
                "/catalog/TaxLiquidationIRES?$filter=computation_ID eq " +
                computationID
            ),
            contentType: "application/json",
            type: "GET",
            dataType: "json",
            async: false,
            success: function (oCompleteEntry) {
              that._setRitenute(oCompleteEntry);
            },
            error: function (error) {
              sap.m.MessageToast.show("Error");
            },
          });
        },

        _setRitenute(data) {
          var oModelRedditoImponibile = this.getView()
            .getModel("oModelRedditoImponibile")
            .getData();
          var impostaNettaIRES = oModelRedditoImponibile.filter(
            (taxLiquidation) => taxLiquidation.percentualeNetta !== null
          );
          var redditoImponibile = impostaNettaIRES[0].redditoImponibile;
          var sImpostaDovuta = this.getResourceBundle().getText(
            "sImpostaDovuta"
          );
          var sDescrRitenute = this.getResourceBundle().getText(
            "descrRitenute"
          );
          var sDescrCrediti = this.getResourceBundle().getText("sDescrCrediti");
          var sDetrazioni = this.getResourceBundle().getText("sDetrazioni");

          if (data.value.length > 0) {
            var R = data.value.filter((importo) => importo.tipologia === "R");
            var C = data.value.filter((importo) => importo.tipologia === "C");
            var D = data.value.filter((importo) => importo.tipologia === "D");

            var Rimporto = R[0].importo;
            var Cimporto = C[0].importo;
            var Dimporto = D[0].importo;
            var impostaDovutaIRES =
              redditoImponibile + Rimporto + Cimporto + Dimporto;
            var aRitenute = [
              {
                descrizione: sDescrRitenute,
                importo: Rimporto,
                tipologia: "R",
              },
              {
                descrizione: sDescrCrediti,
                importo: Cimporto,
                tipologia: "C",
              },
              {
                descrizione: sDetrazioni,
                importo: Dimporto,
                tipologia: "D",
              },
              {
                descrizione: sImpostaDovuta,
                importo: impostaDovutaIRES,
                tipologia: null,
              },
            ];
          } else {
            var aRitenute = [
              { descrizione: sDescrRitenute, importo: 0, tipologia: "R" },
              { descrizione: sDescrCrediti, importo: 0, tipologia: "C" },
              { descrizione: sDetrazioni, importo: 0, tipologia: "D" },
              {
                descrizione: sImpostaDovuta,
                importo: redditoImponibile,
                tipologia: null,
              },
            ];
          }
          var oModel = new JSONModel(aRitenute);
          this.getView().setModel(oModel, "oModelRitenute");
        },

        onSaveIRES: function () {
          var modello = this.getView().getModel("oModelRitenute");
          var data = modello.getData();
          var tipologiaNotNull = data.filter(
            (taxLiquidation) => taxLiquidation.tipologia !== null
          );
          //data.pop(tipologiaNull);

          var computationID = this.getView().getModel("oModelTestata").getData()
            .computationID;

          var that = this;

          var dati = tipologiaNotNull.map((arr) => {
            return {
              tipologia: arr.tipologia,
              importo: arr.importo,
            };
          });

          var taxLiquidationIRES = JSON.stringify({
            TaxLiquidationIRES: dati,
          });

          //var importo = data[i].importo;

          /*var taxLiquidationIRES = JSON.stringify({
                    computation_ID: computationID,
                    tipologia: tipologia,
                    importo: importo,
                });*/

          jQuery.ajax({
            url: jQuery.sap.getModulePath(
              sap.ui.getCore().sapAppID +
                "/catalog/Computations/" +
                computationID
            ),
            contentType: "application/json",
            type: "PATCH",
            dataType: "json",
            data: taxLiquidationIRES,
            async: false,
            success: function (oCompleteEntry) {
              sap.m.MessageToast.show("Success");
              that._getRitenute();
            },
            error: function (error) {
              sap.m.MessageToast.show("Error");
            },
          });
        },

        _setCredito: function () {
          var computationID = this.getView().getModel("oModelTestata").getData()
            .computationID;
          var imposta = this.getView().getModel("oModelTestata").getData()
            .imposta;
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

              var sCreditoPrecedente = that
                .getResourceBundle()
                .getText("sCreditoPrecedente");
              var sCreditoAcquisito = that
                .getResourceBundle()
                .getText("sCreditoAcquisito");
              var sCreditoPrecInComp = that
                .getResourceBundle()
                .getText("sCreditoPrecInComp");
              var sCreditoPrecUtil = that
                .getResourceBundle()
                .getText("sCreditoPrecUtil");

              if(V.length > 0){
                var fVimporto = V[0].Importo;
                var oCreditoPrec = [
                    {
                      importo: fVimporto + V[0].creditoDebitoUnicoLFY,
                      descrizione: sCreditoPrecedente,
                    },
                  ];
              }
              else{
                var fVimporto = 0;
                var oCreditoPrec = [
                    {
                      importo: 0,
                      descrizione: sCreditoPrecedente,
                    },
                  ];
              }
              
              if(AM.length > 0){
                var fAMimporto = AM[0].Importo;
                var oCreditoAcquisito = {
                    importo: fAMimporto,
                    descrizione: sCreditoAcquisito,
                  };
              }
              else{
                var fAMimporto = 0;
                var oCreditoAcquisito = {
                    importo: 0,
                    descrizione: sCreditoAcquisito,
                  };
              }
              
              if(C.length > 0){
                var fCimporto = C[0].Importo;
                var oCreditoPrecComp = {
                    importo: fCimporto,
                    descrizione: sCreditoPrecInComp,
                  };                  
              }
              else{
                var fCimporto = 0;
                var oCreditoPrecComp = {
                    importo: 0,
                    descrizione: sCreditoPrecInComp,
                  };
              }
              

              var oCreditoPrecUtil = {
                importo: fVimporto + fAMimporto + fCimporto,
                descrizione: sCreditoPrecUtil,
              };

              oCreditoPrec.push(
                oCreditoAcquisito,
                oCreditoPrecComp,
                oCreditoPrecUtil
              );

              var oModel = new JSONModel(oCreditoPrec);
              that.getView().setModel(oModel, "oModelCredito");
            },
            error: function (error) {
              sap.m.MessageToast.show("Error");
            },
          });
        },

        _setVersamenti: function () {
          var computationID = this.getView().getModel("oModelTestata").getData()
            .computationID;
          var imposta = this.getView().getModel("oModelTestata").getData()
            .imposta;
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

              if(A.length > 0){
                var oVersamenti = [
                    {
                      importo: A[0].Importo,
                      descrizione: sVersamenti,
                    },
                  ];
              }
              else{
                var oVersamenti = [
                    {
                      importo: 0,
                      descrizione: sVersamenti,
                    },
                  ];
              }

              var oModel = new JSONModel(oVersamenti);
              that.getView().setModel(oModel, "oModelVersamenti");
            },
            error: function (error) {
              sap.m.MessageToast.show("Error");
            },
          });
        },

        _setImpostaCredito: function () {
          var imposta = this.getView().getModel("oModelTestata").getData()
            .imposta;
          var sImpostaCredito = this.getResourceBundle().getText(
            "sImpostaCredito"
          );
          var modelloCredito = this.getView()
            .getModel("oModelCredito")
            .getData();
          var modelloVersamenti = this.getView()
            .getModel("oModelVersamenti")
            .getData();
          var importoCreditoUtil = modelloCredito.filter(
            (credito) =>
              credito.descrizione ===
              this.getResourceBundle().getText("sCreditoPrecUtil")
          )[0].importo;
          var importoVersamenti = modelloVersamenti[0].importo;

          if (imposta === "IRES") {
            var modelloRitenute = this.getView()
              .getModel("oModelRitenute")
              .getData();
            var tipologiaNull = modelloRitenute.filter(
              (taxLiquidation) => taxLiquidation.tipologia === null
            );
            var importoImpostaDovutaIres = tipologiaNull[0].importo;
            var oImpostaCredito = [
              {
                descrizione: sImpostaCredito,
                importo:
                  importoVersamenti +
                  importoCreditoUtil +
                  importoImpostaDovutaIres,
              },
            ];
          } else {
            var impostaDovutaIRAP = parseFloat(this.getView().getModel("oModelTaxRates").getData()[0].ImpostaIRAPTot);
            var oImpostaCredito = [
              {
                descrizione: sImpostaCredito,
                importo:
                  importoVersamenti +
                  importoCreditoUtil +
                  impostaDovutaIRAP,
              },
            ];
          }

          var oModel = new JSONModel(oImpostaCredito);
          this.getView().setModel(oModel, "oModelImpostaCredito");
        },

        _setTaxRates: function () {
          var computationID = this.getView().getModel("oModelTestata").getData()
            .computationID;

          var that = this;
          jQuery.ajax({
            url: jQuery.sap.getModulePath(
              sap.ui.getCore().sapAppID +
                "/catalog/RegionIRAPTaxLiquidation?$filter=computazioneID eq " +
                computationID
            ),
            contentType: "application/json",
            type: "GET",
            dataType: "json",
            async: false,
            success: function (oCompleteEntry) {
              var data = oCompleteEntry.value;

              var oTotale = [
                {
                  ID: null,
                  descrizione: "Totali",
                  imponibilePrevidenziale: 0,
                  ValoreProduzioneNetta: 0,
                  current: 0,
                  ImpostaIRAP: 0,
                },
              ];

              data.push(oTotale[0]);

              var oModel = new JSONModel(data);
              that.getView().setModel(oModel, "oModelTaxRates");
              that._setTotali();
            },
            error: function (error) {
              sap.m.MessageToast.show("Error");
            },
          });
        },

        _setTotali: function () {
          var oModel = this.getView().getModel("oModelTaxRates");
          var data = oModel.getData();

          var imponibilePrevidenzialeTot = data[0].imponibilePrevidenzialeTot;
          var currentAvg = data[0].currentAvg;
          var ImpostaIRAPTot = data[0].ImpostaIRAPTot;

          var oTotale = {
            ID: null,
            descrizione: "Totali",
            imponibilePrevidenziale: imponibilePrevidenzialeTot,
            ValoreProduzioneNetta: 0,
            current: currentAvg,
            ImpostaIRAP: ImpostaIRAPTot,
          };

          for (var i = 0; i < data.length; i++) {
            oTotale.ValoreProduzioneNetta += data[i].ValoreProduzioneNetta;
          }

          oModel.getData()[data.length - 1] = oTotale;
          oModel.refresh();
        },
      }
    );
  }
);
