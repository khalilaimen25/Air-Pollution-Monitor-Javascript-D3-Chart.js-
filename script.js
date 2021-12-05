
var map = L.map('map').setView([48.835, 2.384], 5);

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);



var marker = L.marker([48.835, 2.384], { draggable: true }).addTo(map);

var popup = L.popup({autoClose: true});

function onMapClick(e) {
    // map.removeLayer(marker)
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
    // console.log(e.latlng)
}

map.on('click', onMapClick);

n = new Date(); y = n.getFullYear();m = n.getMonth() + 1;d = n.getDate();
cd = y + "-" + m + "-" + d;

$("#start").attr("max","2022-01-01")
$("#start").attr("min","2018-01-01")
$("#start").attr("value",cd)

$("#end").attr("max","2022-01-01")
$("#end").attr("min","2018-01-01")
$("#end").attr("value",cd)

// get current location infos
$("#btn-current").on("click", function(){

    latlng = marker.getLatLng()

    url_p = "https://api.openweathermap.org/data/2.5/air_pollution?lat="+latlng["lat"]+"&lon="+latlng["lng"]+"&appid=2ace548c596da63a31843e08fcdf659d"
    d3.json(url_p, function(data){
        // console.log(data)
        $("#current-pollution-info").css("display", "block")
       
        components = data["list"][0]["components"]
        // $("#p-info").html(data["list"][0]["components"]["co"])
        d3.select("#c-co").html(components["co"]/1000)
        d3.select("#c-no2").html(components["no2"])
        d3.select("#c-o3").html(components["o3"])
        d3.select("#c-so2").html(components["so2"])
        d3.select("#c-nh3").html(components["nh3"])
        d3.select("#c-pm2_5").html(components["pm2_5"])
        d3.select("#c-pm10").html(components["pm10"])

        x = qualitative_name("co", components["co"]/1000)
        d3.select("#c-co-qname").attr("style", "color:"+x[1]+";font-weight:bold;").html(x[0])
        x = qualitative_name("no2", components["no2"])
        d3.select("#c-no2-qname").attr("style", "color:"+x[1]+";font-weight:bold;").html(x[0])
        x = qualitative_name("o3", components["o3"])
        d3.select("#c-o3-qname").attr("style", "color:"+x[1]+";font-weight:bold;").html(x[0])
        x = qualitative_name("so2", components["so2"])
        d3.select("#c-so2-qname").attr("style", "color:"+x[1]+";font-weight:bold;").html(x[0])
        x = qualitative_name("nh3", components["nh3"])
        d3.select("#c-nh3-qname").attr("style", "color:"+x[1]+";font-weight:bold;").html(x[0])
        x = qualitative_name("pm2_5", components["pm2_5"])
        d3.select("#c-pm2_5-qname").attr("style", "color:"+x[1]+";font-weight:bold;").html(x[0])
        x = qualitative_name("pm10", components["pm10"])
        d3.select("#c-pm10-qname").attr("style", "color:"+x[1]+";font-weight:bold;").html(x[0])

        location.href = "#c-result"
    })

    url_w = "https://api.openweathermap.org/data/2.5/weather?lat="+latlng["lat"]+"&lon="+latlng["lng"]+"&units=metric&appid=2ace548c596da63a31843e08fcdf659d"
    d3.json(url_w, function(data){
        // console.log(data)
        d3.select("#city").html(data["name"])
        d3.select("#country").html(data["sys"]["country"])
        d3.select("#temp").html(data["main"]["temp"]+"°C")
        d3.select("#w-main").html(data["weather"][0]["main"]+", "+data["weather"][0]["description"])
        var iconurl = "http://openweathermap.org/img/w/" + data["weather"][0]["icon"] + ".png";
        d3.select("#w-icon").attr("src", iconurl)
        d3.select("#wind").html(data["wind"]["speed"]+" m/s")
        d3.select("#humidity").html(data["main"]["humidity"]+"%")
        d3.select("#pressure").html(data["main"]["pressure"]+" hPa")
        d3.select("#visib").html(data["visibility"]/1000+" km")

    })
  
})

// get periodic location info
$("#btn-period").on("click", function(){

    start = get_unixtime($("#start").val())
    end = get_unixtime($("#end").val())

    if(isNaN(start) || isNaN(end)){
        alert("Choose a valid date")
    }else{

    $("#p-result").css("display", "block")

    if(parseInt(start) > parseInt(end)){
        x = start;
        start = end;
        end = x;
    }
   
    latlng = marker.getLatLng()
   
    url = "https://api.openweathermap.org/data/2.5/air_pollution/history?lat="+latlng["lat"]+"&lon="+latlng["lng"]+"&start="+start+"&end="+end+"&appid=2ace548c596da63a31843e08fcdf659d"
    d3.json(url, function(data){
        // console.log(data["list"].length)
        tab = [];
        tab_co = [];
        tab_no2 = [];
        tab_o3 = [];
        tab_so2 = [];
        tab_nh3 = [];
        tab_pm2_5 = [];
        tab_pm10 = [];
        tab_dt = [];
        for(i=0; i<data["list"].length;i++){
            tab_no2.push(data["list"][i]["components"]["no2"])
            tab_co.push(data["list"][i]["components"]["co"]/1000)
            tab_o3.push(data["list"][i]["components"]["o3"])
            tab_so2.push(data["list"][i]["components"]["so2"])
            tab_nh3.push(data["list"][i]["components"]["nh3"])
            tab_pm2_5.push(data["list"][i]["components"]["pm2_5"])
            tab_pm10.push(data["list"][i]["components"]["pm10"])
            d = get_date(data["list"][i]["dt"])
            tab_dt.push(d)
        }
        tab = [tab_dt, tab_co, tab_no2, tab_o3, tab_so2, tab_nh3, tab_pm2_5, tab_pm10]
        // console.log(tab)
        draw_chart(tab)
        location.href = "#p-result"
      
    })
}
})

//convert date to unixtime
function get_unixtime(date){
    date = new Date(date).getTime() / 1000 //unixtime 1638057600
    return date
}

//convert unixtime to date
function get_date(unix){
    date = new Date(unix * 1000)
    y = date.getFullYear();m = date.getMonth() + 1;d = date.getDate();
    cd = y + "-" + m + "-" + d;
    return cd
}

//get qualitative name from polluantes values
function qualitative_name(p, val){
    q_name = "unknown"
    
    switch (p){
        case "co":
            if(val>=0 && val<=1) {q_name = "Good";break;}
            if(val>1 && val<=2) {q_name = "Fair";break;}
            if(val>2 && val<=10) {q_name = "Moderate";break;}
            if(val>10 && val<=17) {q_name = "Poor";break;}
            if(val>17 && val<=34) {q_name = "Very poor";break;}
            if(val>34) {q_name = "Severe";break;}
        case "no2":
            if(val>=0 && val<=40) {q_name = "Good";break;}
            if(val>40 && val<=80) {q_name = "Fair";break;}
            if(val>80 && val<=180) {q_name = "Moderate";break;}
            if(val>180 && val<=280) {q_name = "Poor";break;}
            if(val>280 && val<=400) {q_name = "Very poor";break;}
            if(val>400) {q_name = "Severe";break;    }
        case "o3":
            if(val>=0 && val<=50) {q_name = "Good";break;}
            if(val>50 && val<=100) {q_name = "Fair";break;}
            if(val>100 && val<=168) {q_name = "Moderate";break;}
            if(val>168 && val<=208) {q_name = "Poor";break;}
            if(val>208 && val<=748) {q_name = "Very poor";break;}
            if(val>748) {q_name = "Severe";break;  }
        case "so2":
            if(val>=0 && val<=40) {q_name = "Good";break;}
            if(val>40 && val<=80) {q_name = "Fair";break;}
            if(val>80 && val<=380) {q_name = "Moderate";break;}
            if(val>380 && val<=800) {q_name = "Poor";break;}
            if(val>800 && val<=1600) {q_name = "Very poor";break;}
            if(val>1600) {q_name = "Severe";break;  }
        case "nh3":
            if(val>=0 && val<=200) {q_name = "Good";break;}
            if(val>200 && val<=400) {q_name = "Fair";break;}
            if(val>400 && val<=800) {q_name = "Moderate";break;}
            if(val>800 && val<=1200) {q_name = "Poor";break;}
            if(val>1200 && val<=1800) {q_name = "Very poor";break;}
            if(val>1800) {q_name = "Severe";break;  }
        case "pm2_5":
            if(val>=0 && val<=30) {q_name = "Good";break;}
            if(val>30 && val<=60) {q_name = "Fair";break;}
            if(val>60 && val<=90) {q_name = "Moderate";break;}
            if(val>90 && val<=120) {q_name = "Poor";break;}
            if(val>120 && val<=250) {q_name = "Very poor";break;}
            if(val>250) {q_name = "Severe";break;  }
        case "pm10":
            if(val>=0 && val<=50) {q_name = "Good";break;}
            if(val>50 && val<=100) {q_name = "Fair";break;}
            if(val>150 && val<=250) {q_name = "Moderate";break;}
            if(val>250 && val<=350) {q_name = "Poor";break;}
            if(val>350 && val<=430) {q_name = "Very poor";break;}
            if(val>430) {q_name = "Severe";break;}                                
    }

    color = ""
    switch(q_name){
        case "Good":
            color = "#03a300";break;
        case "Fair":
            color = "#57a300";break;
        case "Moderate": 
            color = "#dbd800";break;
        case "Poor":
            color = "#fa7500";break;  
        case "Very poor":
            color = "#fa2500";break;  
        case "Severe":
            color = "#630f00";break;           
    }
    return [q_name, color]
}

function draw_chart(mydata){
    // console.log(mydata[2])
    $("#myChart").remove()
    $("#chart-placeholder").append("<canvas id='myChart'></canvas>")
    const ctx = document.getElementById('myChart').getContext('2d')

    const DATA_COUNT = mydata[0].length;
    const NUMBER_CFG = { count: DATA_COUNT, min: 0, max: 1500 };

    const labels = mydata[0];
    const data = {
        labels: labels,
        datasets: [
            {
                label: 'CO',
                data: mydata[1],
                borderColor: '#ca2727',
                backgroundColor: 'rgba(202, 39, 39, 0.425)',
                yAxisID: 'y',
            },
            {
                label: 'NO2',
                data:mydata[2],
                borderColor: '#0c40eb',
                backgroundColor: '#0c40eb48',
                yAxisID: 'y',
            },
            {
                label: 'O3',
                data:mydata[3],
                borderColor: '#008000',
                backgroundColor: '#008000',
                yAxisID: 'y',
            },
            {
                label: 'SO2',
                data:mydata[4],
                borderColor: '#f59f00',
                backgroundColor: '#f59f00',
                yAxisID: 'y',
            },
            {
                label: 'NH3',
                data:mydata[5],
                borderColor: '#00e1ff',
                backgroundColor: '#00e1ff',
                yAxisID: 'y',
            },
            {
                label: 'PM2.5',
                data:mydata[6],
                borderColor: '#8c00ff',
                backgroundColor: '#8c00ff',
                yAxisID: 'y',
            },
            {
                label: 'PM10',
                data:mydata[7],
                borderColor: '#c416c4',
                backgroundColor: '#c416c4',
                yAxisID: 'y',
            }
        ]
    };
    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            stacked: false,
            plugins: [{
                title: {
                    display: true,
                    text: 'Pollutant Periodic Charts'
                },
                
                zoom: {
                    zoom: {
                        enabled: true,
                        drag: true,
                        mode: 'xy',
                        speed: 0.1,
                        threshold: 2,
                        sensitivity: 3
                    }
                }
				
            }],
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                },
                y1: {
                    type: 'linear',
                    display: false,
                    position: 'right',

                    // grid line settings
                    grid: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                },
            }
        },
    };

    const myChart = new Chart(ctx, config)
    
}

function setDateTime(){
    d = new Date()
    dt = d.getDate()+"-"+d.getMonth()+"-"+d.getFullYear()+"  "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()
    $('#date_time').html(dt)
}

setInterval(setDateTime, 1000)
// mydata = [['2021-01-01','2021-02-01','2021-03-01','2021-04-01'],[12,30,5,20]]

// draw_chart(mydata)
//     const interval = setInterval(function() {
//    // method to be executed;
//    console.log("khalil")
//     }, 1);
