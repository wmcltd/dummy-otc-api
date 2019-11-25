var Axios = require('axios')
var parser = require('xml2json');

function getDIT(){
    var creds = {
        userId: 'JETLINE2009',
        password: 'X81JETW34',
        accesskey: '4C8118C688C76410',
    };
    var fromData = {
        zip: '06610',
        city: 'Bridgeport',
        state: 'CT',
        pickupDate: '20191126',
    };
    var destData = {
        zip: '56572',
        city: 'Pelican Rapids',
        state: 'MN',
        residentialIndicator: true,
    };

    var request = '';
    request += "<?xml version='1.0' encoding='utf-8'?>";
    request += "<AccessRequest xml:lang='en-US'>";
    request +=
        '<AccessLicenseNumber>' +
        creds.accesskey +
        '</AccessLicenseNumber>';
    request += '<UserId>' + creds.userId + '</UserId>';
    request += '<Password>' + creds.password + '</Password>';
    request += '</AccessRequest>';
    request += "<?xml version='1.0' encoding='utf-8'?>";
    request += "<TimeInTransitRequest xml:lang='en-US'>";
    request += '<Request>';
    request += '<TransactionReference>';
    request += '<CustomerContext />';
    request += '<XpciVersion>1.0002</XpciVersion>';
    request += '</TransactionReference>';
    request += '<RequestAction>TimeInTransit</RequestAction>';
    request += '</Request>';

    request += '<TransitFrom>';
    request += '<AddressArtifactFormat>';
    request +=
        '<PoliticalDivision1>' + fromData.state + '</PoliticalDivision1>';
    request += '<CountryCode>US</CountryCode>';
    request +=
        '<PostcodePrimaryLow>' + fromData.zip + '</PostcodePrimaryLow>';
    request += '</AddressArtifactFormat>';
    request += '</TransitFrom>';
    request += '<TransitTo>';
    request += '<AddressArtifactFormat>';
    // request += "<PoliticalDivision1>"+destData.state+"</PoliticalDivision1>";
    request +=
        '<PoliticalDivision2>' + destData.city + '</PoliticalDivision2>';
    request += '<CountryCode>US</CountryCode>';
    request +=
        '<PostcodePrimaryLow>' + destData.zip + '</PostcodePrimaryLow>';
    request +=
        '<ResidentialAddressIndicator>' +
        destData.residentialIndicator +
        '</ResidentialAddressIndicator>';
    request += '</AddressArtifactFormat>';
    request += '</TransitTo>';
    request += '<ShipmentWeight>';
    request += '<UnitOfMeasurement>';
    request += '<Code>LBS</Code>';
    request += '</UnitOfMeasurement>';
    /* TODO need to determine best method to return estimated shipment weight */
    request += '<Weight>10</Weight>';
    request += '</ShipmentWeight>';
    request += '<InvoiceLineTotal>';
    request += '<CurrencyCode>USD</CurrencyCode>';
    request += '<MonetaryValue>50</MonetaryValue>';
    request += '</InvoiceLineTotal>';
    request += '<PickupDate>' + fromData.pickupDate + '</PickupDate>';
    request += '<DocumentsOnlyIndicator />';
    request += '</TimeInTransitRequest>';

    const url = 'https://onlinetools.ups.com/ups.app/xml/TimeInTransit'
        
    return Axios({
        method: 'post',
        url: url,
        dataType: 'xml',
        data: request
    })
    .then(response =>{
        if(response){
            var json = parser.toJson(response.data);
        }
        return JSON.parse(json);
    })
   
}
getDIT().then(data =>{
    var dit = data.TimeInTransitResponse.TransitResponse.ServiceSummary;
    dit.forEach(s =>{
        if (s.Service.Code == "GND"){
            console.log(s.Service.Code, "Transit Days", s.EstimatedArrival.BusinessTransitDays);

        }   
    })
})
