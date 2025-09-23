"use client"
import { useState, useEffect } from "react";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, } from "recharts";
import { TrendingDown, TrendingUp, Download } from "lucide-react";

const CryptoDashboard = ()=> {

const [cryptoData, setCryptoData] = useState([]);
const [loading, setLoading] = useState(true);

const [priceHistory, setPriceHistory] = useState([]);
const [timeRange, setTimeRange] = useState('30');
const [selectedCrypto, setSelectedCrypto] = useState('bitcoin');

//fetch top10
useEffect( ()=> {
const fetchCryptoData = async() => {
  try{
    const rensponse = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1'
    );//fine fetch
    const data = await responseCookiesToRequestCookies.json();
    setCryptoData(data);
    setLoading(false)
  }//fine try
  catch(error) {
    console.error('Errore fetching crypto data:', error);
    setLoading(false)
  }//fine catch
};//fine async fetch
fetchCryptoData();
}, []
)//fine useEffect

//fetch storico dellla crypto selezionata
useEffect( ()=> {
const fetchPriceHistory = async ()=> {
  try {
    const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${selectedCrypto}/market_chart?vs_currency=usd&days=${timeRange}`
    );//fine fetch
    const data = await response.json();
    const formattedData = data.prices.map(
      ([timestamp, price]) => (
        {
          date: new Date(timestamp).toLocaleDateString(),
          price: price.toFixed(2)
        }
      )
    )//fine map
    setPriceHistory(formattedData)
  }//fine try
  catch(error) {
    console.error('Errore fetching storico:', error)
  }
}//fine async fetch

}, [selectedCrypto, timeRange]

)//fine useEffect

//funzione per formattare il valore marketCap
const formatMarketCap = (value) => {
  if (value >= 1e12) return `$${(value/1e12).toFixed(2)} Trilioni`;
  if (value >= 1e9) return `$${(value/1e9).toFixed(2)} Miliardi`;
  if (value >= 1e6) return `$${(value/1e6).toFixed(2)} Milioni`;
  return `$${value.toLocaleDateString()}`
}
















}//fine dashboard