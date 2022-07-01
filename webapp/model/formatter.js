sap.ui.define([], function () {
	"use strict";
	return {
		formatRipartizione: function (imponibile, totale) {
            if(imponibile === null)
                imponibile = 0;
			var num_imponibile = parseFloat(imponibile);
            var ripartizione = (num_imponibile / totale * 100).toFixed(3);
            return ripartizione + "%";
		}
	};
});