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
          
        },

        _setRedditoImponibile: function(oEvent){
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
                    var percentuale = null
                    
                    var oModel = new JSONModel([{descrizione : sDescrizioneReddito, percentualeNetta: percentuale, redditoImponibile: fRedditoImponibile}]);
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
                  var percImpostaNetta = oCompleteEntry.value[0].currentAvg;
                  var oModel = that.getView().getModel("oModelRedditoImponibile");
                  var data = oModel.getData();
                  var fRedditoImponibile = data[0].redditoImponibile;
                  var sdescrImpostaNetta = that.getResourceBundle().getText("descrImpostaNetta");
                  var ftotImportoPerc = percImpostaNetta * fRedditoImponibile;
                  var nuovaRiga = {descrizione: sdescrImpostaNetta, percentualeNetta: percImpostaNetta + "%", redditoImponibile: ftotImportoPerc};
                  var updateModel = data.concat(nuovaRiga);

                  var oModelPercentuale = new JSONModel();
                  oModelPercentuale.setData(updateModel);
                  that.getView().setModel(oModelPercentuale, "oModelRedditoImponibile");
                },
                error: function (error) {
                  sap.m.MessageToast.show("Error");
                },
            });
        },

        _setRitenute: function(){
            var sDescrRitenute = this.getResourceBundle().getText("descrRitenute");
            var sDescrCrediti = this.getResourceBundle().getText("sDescrCrediti");
            var sDetrazioni = this.getResourceBundle().getText("sDetrazioni");
            var descrizioni = [{descrizione: sDescrRitenute}, {descrizione: sDescrCrediti}, {descrizione: sDetrazioni}];
            var oModel = new JSONModel(descrizioni);
            this.getView().setModel(oModel, "oModelRitenute");
        }
      }
    );
  }
);
