var express = require("express");
var moment = require("moment");
var app = express();
// app.listen(3000, () => {
//  console.log("Server running on port 3000");
// })


let port = process.env.PORT;
if (port == null || port == "") {
	port = 8000;
}

app.listen(port);

/*
* getDIT
* Call UPS transit time app and return ground days
* from FOBLoc to DestLoc
*/
app.get("/getDIT/:from/:dest", (req, res, next) =>{
	console.log('Run getDIT')
	res.json(req.params.to)
	var Axios = require('axios');
    var parser = require('xml2json');
	console.log('received params')
	console.log(req.params.from)
	console.log(req.params.dest)
    function getDIT(fromData, destData) {
		console.log('params')
		console.log(fromData)
		console.log(destData)
		var fromData = JSON.parse(fromData)
		var destData = JSON.parse(destData)

		// var fobs = [
        //     { fromZip: '06610', fromCity: 'Bridgeport', fromState: 'CT' },
        //     { fromZip: '29340', fromCity: 'Gaffney', fromState: 'SC' },
        //     { fromZip: '17339', fromCity: 'Lewisberry', fromState: 'PA' },
        //     { fromZip: '93725', fromCity: 'Fresno', fromState: 'CA' },
        // ];

		
        var creds = {
            userId: 'JETLINE2009',
            password: 'X81JETW34',
            accesskey: '4C8118C688C76410',
		};
        // var fromData = {
        //     zip: fromZip,
        //     city: 'Bridgeport',
        //     state: 'CT',
        //     pickupDate: '20191126',
        // };
        // var destData = {
        //     zip: '56572',
        //     city: 'Pelican Rapids',
        //     state: 'MN',
        //     residentialIndicator: true,
        // };

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
		console.log(request)
        const url = 'https://onlinetools.ups.com/ups.app/xml/TimeInTransit';

        return Axios({
            method: 'post',
            url: url,
            dataType: 'xml',
            data: request,
        }).then(response => {
            if (response) {
                var json = parser.toJson(response.data);
            }
            return JSON.parse(json);
        });
    }
    getDIT(req.params.from, req.params.dest).then(data => {
        var dit = data.TimeInTransitResponse.TransitResponse.ServiceSummary;
        dit.forEach(s => {
            if (s.Service.Code == 'GND') {
                console.log(
                    s.Service.Code,
                    'Transit Days',
					s.EstimatedArrival.BusinessTransitDays,
					s
				);
				res.json({
                    service: s.Service.Code,
					transitDays: s.EstimatedArrival.BusinessTransitDays,
					deliveryDate:s.EstimatedArrival.Date,
                });	
            }
        });
    });
	
})

//New dummy payloads for otc app
app.get("/itemparams", (req, res, next) => {
	const data = [{
			item: "BG100",
			itemColors: ["Red", "Blue", "Black"],
			itemSizes: [],
			decoOptions: [{
					imprintMethod: 'Silkscreen',
					locations: ['Front', 'Back', 'Side'],
					maxColors: 4,
					notes: '',
				},
				{
					imprintMethod: '4CP Transfer',
					locations: ['Front', 'Back'],
					maxColors: 'FC',
					notes: '',
				},
				{
					imprintMethod: 'Spot Color Transfer',
					locations: ['Front', 'Back'],
					maxColors: 4,
					notes: '',
				},
			],
			minQty: 150,
			maxQty: 2600,
		},
		{
			item: "102A",
			itemColors: ["Black Triblend", "Card Blck Trblnd", "Cream Triblend", "Green Triblend", "Grey Triblend",
				"Mint Triblend", "Navy Triblend", "Orange Triblend", "Red Triblend", "Royal Blk Triblend", "Royal Triblend"
			],
			itemSizes: ['Small', 'Medium', 'Large', 'X-Large'],
			decoOptions: [{
					imprintMethod: 'Silkscreen',
					locations: ['Front', 'Front Left Chest or Full Front (Please Specify)', 'Full Back'],
					maxColors: '3',
					notes: '',
				},

			],
			minQty: 48,
			maxQty: 576,
		}
	]

	
	res.json(data);
});

/*
* Test API for development only.
* Returns the best ship date and location for the request and filters to locations with inventory
* Accepts params for  dept, reqQty.
* Must filter results to locations with sufficient inventory AND capacity in the dept.
*
* SHOULD WE RETURN ONLY THE BEST SHIP DATE AVAILABLE FOR A SUPPLIED LOCATION, OR FOR EACH LOCATION INCLUDED IN REQUEST (WHICH 
*   IS DETERMINED BY FOB CAPACITY API IN globalParams.fobData)
*/
app.get("/capacity/:dept/:qty/:locations/:colors/", (req, res, next) =>{
	console.log('call loadCapacity')
	//calculate hits (in prod, use capacity formulas for the supplied/mapped dept)
	const hits = req.params.qty * req.params.colors * req.params.locations
	const searchData = { dept: req.params.dept, qty: hits}
	console.log('searching for ', searchData)
	const csv = require('csv-parser');
	const fs = require('fs');
	let capacity = []
	fs.createReadStream('capacity.csv')
		.pipe(csv())
		.on('data', row => {
			capacity.push(row)
		})
		.on('end', () => {
			//Search capacity using searchData criteria for first matching date with capacity
			console.log('open-close')
			console.log(capacity)
			let capacityOptions = []
			//Search each date returned, if more than 1 day from today and check capacity versus request
			//return capacityOpions array with all possible dates within the next 4 weeks (arbitrary)
			capacity.forEach(function (el) {
				
				if (
					moment(new Date(el.Date)) > moment(new Date()).add('days', 1) &&
					moment(new Date(el.Date)) < moment(new Date(el.Date)).add('weeks', 1) &&
					searchData.qty <= el.Capacity &&
					searchData.dept == el.Dept
				) {
					capacityOptions.push(el)
				}
			})
			console.log('close')
			capacityOptions.sort((a, b) => (a.Date > b.Date ? 1 : -1));
			console.log('BestShipDate for '+searchData.qty+' :', capacityOptions[0])
			let response = {request: searchData, allOptions: capacityOptions, bestShipDate: capacityOptions[0]}
			res.json(response)
		})
		
});

/*
* Return all inventory, by location to populate a reference table
* In production, add a matrix parent param
*/
app.get("/allinventory", (req, res, next) =>{
	const csv = require('csv-parser');
	const fs = require('fs');
	let inventory = []
	fs.createReadStream('inventory.csv')
		.pipe(csv())
		.on('data', row => {
			inventory.push(row)
		})
		.on('end', () => {
			//Search inventory using searchData criteria for each location with sufficient inventory
			let inventoryOptions = []
			// inventory.forEach(function (el) {
			// 	console.log("searching...", searchData.item, el.item, searchData.qty, 'type=' + typeof (searchData.qty), el.availInventory)
			// 	if (
			// 		searchData.item === el.item &&
			// 		parseInt(searchData.qty) <= parseInt(el.availInventory)
			// 	) {
			// 		inventoryOptions.push(el)
			// 	}
			// })
			// console.log(inventoryOptions)
			// let response = { item: searchData.item, requestQty: searchData.qty, result: inventoryOptions }
			res.json(inventory)
		})
})

app.get("/inventory/:item/:qty/", (req, res, next) =>{
	const searchData = {item: req.params.item, qty: req.params.qty}
	let inventory = []
	const csv = require('csv-parser');
	const fs = require('fs');
	fs.createReadStream('inventory.csv')
		.pipe(csv())
		.on('data', row => {
			inventory.push(row)
		})
		.on('end', () => {
			//Search inventory using searchData criteria for each location with sufficient inventory
			let inventoryOptions = []
			inventory.forEach(function (el) {
				console.log("searching...",searchData.item, el.item, searchData.qty, 'type=' + typeof(searchData.qty), el.availInventory)
				if (
					searchData.item === el.item &&
					parseInt(searchData.qty) <= parseInt(el.availInventory)
				) {
					inventoryOptions.push(el)
				}
			})
			console.log(inventoryOptions)
			let response = { item: searchData.item, requestQty: searchData.qty, result: inventoryOptions }
			res.json(response)
		})
})

/*
 * OLD VERSION: 
 *Dummy capacity calculation for initial development. Basic response only.
 * Actual API should reference the capacity formulas in NS and map methods to departments
 * Will need to calculate demand based on params supplied, and compare to capacity calendar
 * across locations/departments to determine best productio/ship date, as well as split orders 
 * over catalog quantity over multiple days (including inventory availability).
 * Should also solve for split orders across up to 2 locations for orders over X pcs.
 */ 
app.get("/capacity/:qty/:method/:numLocations/:numColors/:lastProdDate", (req, res, next) =>{
	
	const capacity = [
		{
			location: "CT",
			method: 'silkscreen',
			prodDate: '11-11-19',
			availCapacity: 500
		},
		{
			location: "CT",
			method: 'silkscreen',
			prodDate: '11-12-19',
			availCapacity: 300
		},
		{
			location: "CT",
			method: 'silkscreen',
			prodDate: '11-13-19',
			availCapacity: 400
		},
		{
			location: "CT",
			method: 'silkscreen',
			prodDate: '11-14-19',
			availCapacity: 500
		},
		{
			location: "CT",
			method: 'silkscreen',
			prodDate: '11-15-19',
			availCapacity: 1000
		},
		{
			location: "CT",
			method: 'silkscreen',
			prodDate: '11/18/19',
			availCapacity: 4000
		},
		{
			location: "CT",
			method: 'silkscreen',
			prodDate: '11-19-19',
			availCapacity: 5000
		},
		{
			location: "CT",
			method: 'silkscreen',
			prodDate: '11-20-19',
			availCapacity: 5000
		},
		{
			location: "CT",
			method: 'silkscreen',
			prodDate: '11-21-19',
			availCapacity: 5000
		},
		{
			location: "CT",
			method: 'silkscreen',
			prodDate: '11-22-19',
			availCapacity: 5000
		},
	]
	
	//calculate hits
	var hits = ''
	if(req.params.method == "embroidery"){
		hits = 'unknown'
	}else{
		hits = (req.params.qty * req.params.numColors * req.params.numLocations)
	}
	
	//find latest available ship date for single day production
	const startDate = moment(new Date).format("MM/DD/YYYY")
	var firstProdDate = capacity.find(({
		availCapacity
	}) => availCapacity >= hits);
	const response = [startDate, {hits: hits}, capacity, {location: firstProdDate.location, shipDate: firstProdDate.prodDate, capacity: firstProdDate.capacity} ]

	res.json(response);
});




