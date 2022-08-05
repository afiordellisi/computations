sap.ui.define(
  [
    "sap/ui/model/json/JSONModel",
    "./BaseController",
   

  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    JSONModel,
    BaseController,

  ) {
    "use strict";
    var computazioneID;


    return BaseController.extend(
      "tax.provisioning.computations.controller.Riprese",
      {
        onInit: function () {
          this.getOwnerComponent()
            .getRouter()
            .getRoute("Riprese")
            .attachPatternMatched(this._onObjectMatched, this);

          sap.ui.getCore().sapAppID = this.getOwnerComponent()
            .getMetadata()
            .getManifest()["sap.app"].id;
           var sTarget=this.getView().byId("percentualeTable")
     
        },
        _onObjectMatched: function (oEvent) {
          var oEvent = oEvent.getParameter("arguments");

          computazioneID = oEvent.ID; //ID computazione
          var ripresaID = oEvent.ripresaID; //ID ripresa singola
          var imposta = oEvent.imposta;

          this._setRipresa(ripresaID, computazioneID, imposta);

          this.getView().setModel(
            new JSONModel({
              ID: computazioneID,
              ripresaID: ripresaID,
              imposta: imposta,
            }),
            "IDcomputationModel"
          );
        },

        handleActionPress: function (oEvent) {},

        handleItemPress: function (oEvent) {
          oEvent
            .getSource()
            .getBindingContext("oModelAnagraficaSingola")
            .getObject();

          this.getRouter().navTo(
            "Allegati",
            {
              ID: this.getView().getModel("IDcomputationModel").getData().ID, //computazione ID
              ripresaID: this.getView().getModel("IDcomputationModel").getData()
                .ripresaID,
              codiceGL: oEvent
                .getSource()
                .getBindingContext("oModelAnagraficaSingola")
                .getObject().bilancio_codiceGL,
              imposta: this.getView().getModel("IDcomputationModel").getData()
                .imposta,
            },
            false
          );
        },

        _setRipresa: function (ripresaID, computazioneID, imposta) {
          var that = this;

          jQuery.ajax({
            url: jQuery.sap.getModulePath(
              sap.ui.getCore().sapAppID +
                "/catalog/ConfRipresaAutoView?$count=true&$expand=confRipresa($expand=codiceRipresa)&$filter=ID eq " +
                computazioneID +
                " and confRipresa_codiceRipresa_ID eq '" +
                ripresaID +
                "' and confRipresa_imposta eq '" +
                imposta +
                "'"
            ),
            contentType: "application/json",
            type: "GET",
            dataType: "json",
            async: false,
            success: function (oCompleteEntry) {
              var arr = oCompleteEntry.value;
              var aItems = arr.map((arr) => {
                return {
                  codiceRipresa: arr.confRipresa.codiceRipresa.ID,
                  descrizioneRipresa:
                    arr.confRipresa.codiceRipresa.descrizioneRipresa,
                  riferimentoNormativo:
                    arr.confRipresa.codiceRipresa.riferimentoNormativo,
                  riferimentoDichiarazione:
                    arr.confRipresa.codiceRipresa.riferimentoDichiarazione,
                };
              });
              var oData = {
                oModel1: oCompleteEntry.value,
                oModelRipresa: aItems[0],
                oModelTestata: oCompleteEntry.value[0].confRipresa,
                currency: oCompleteEntry.value[0].currency
              };
              var oModel = new JSONModel(oData);
              that.getView().setModel(oModel, "oModelAnagraficaSingola");
              that._setTotali(computazioneID, imposta, ripresaID);
            },
            error: function (error) {
              sap.m.MessageToast.show("Error");
            },
          });
        },

        _setTotali: function (computazioneID, imposta, ripresaID) {
          var that = this;
          jQuery.ajax({
            url: jQuery.sap.getModulePath(
              sap.ui.getCore().sapAppID +
                "/catalog/ConfRipresaAutoView?$apply=filter(ID eq " +
                computazioneID +
                " and confRipresa_codiceRipresa_ID eq '" +
                ripresaID +
                "' and confRipresa_imposta eq '" +
                imposta +
                "')/aggregate(importoCY with sum as TotaleCY,ripresaAuto with sum as TotaleAuto,ripresaManuale with sum as TotaleManuale,totaleRipresa with sum as TotaleRipresa)"
            ),
            contentType: "application/json",
            type: "GET",
            dataType: "json",
            async: false,
            success: function (oCompleteEntry) {
              var oTotali = oCompleteEntry.value[0];

              var oData = {
                totaleRipresa: oTotali.TotaleRipresa,
                TotaleCY: oTotali.TotaleCY.toFixed(2),
                TotaleAuto: oTotali.TotaleAuto,
                TotaleManuale: oTotali.TotaleManuale,
              };
              var oModel = new JSONModel(oData);
              that.getView().setModel(oModel, "oModelTotali");
            },
            error: function (error) {
              sap.m.MessageToast.show("Error");
            },
          });
        },
      }
    );
  }
);
