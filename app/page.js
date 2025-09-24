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
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1'
    );//fine fetch
    const data = await response.json();
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
  if (selectedCrypto) {
    fetchPriceHistory();
  }
}, [selectedCrypto, timeRange]

)//fine useEffect

//funzione per formattare il valore marketCap
const formatMarketCap = (value) => {
  if (value >= 1e12) return `$${(value/1e12).toFixed(2)} Trilioni`;
  if (value >= 1e9) return `$${(value/1e9).toFixed(2)} Miliardi`;
  if (value >= 1e6) return `$${(value/1e6).toFixed(2)} Milioni`;
  return `$${value.toLocaleString()}`
}

//funzione per formattare il priceChange
const formatPriceChange = (change)=> {
  const isPositive = change >=0 ;

  return (
    <div className={
      `flex items-center
      ${isPositive? 'text-green-600' : 'text-red-600'
      }`
      }>

      {isPositive? 
      <TrendingUp className="w-4 h-4 mr-1"/> :
      <TrendingDown className="w-4 h-4 mr-1"/>
      }

      {Math.abs(change).toFixed(2)}%

    </div>
  )
}

//funzione per esportare in CSV
  const exportToCSV = () => {
    const csvContent = [
      ['Cryptocurrency', 'Price (USD)', '24h Change (%)', 'Market Cap (USD)'],
      ...cryptoData.map(crypto => [
        crypto.name,
        crypto.current_price,
        crypto.price_change_percentage_24h.toFixed(2),
        crypto.market_cap
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'crypto_data.csv';
    a.click();
  };

if(loading) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-xl text-gray-600">Loading...</div>
    </div>
  )
}


return (
<div className="min-h-screen bg-gray-50 p-6"> 
  <div className="max-w-7xl mx-auto">
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold text-gray-900">
        Crypto Market Dashboard
      </h1>
      <button onClick={exportToCSV} 
      className="flex items-center 
      bg-blue-600 text-white hover:bg-blue-700
      transition-colors
      px-4 py-2
      rounded-lg"> 
        <Download className="w-4 h-4 mr-2"/>
        Export CSV 
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {
        cryptoData.slice(0,10).map(
          (crypto) => (
            <div key={crypto.id}
            className={`bg-white rounded-lg p-4
            shadow cursor-pointer transition-all
            hover:shadow-lg
            ${selectedCrypto === crypto.id? 'ring-2 ring-blue-500' : ''}`
            }
            onClick={()=> setSelectedCrypto(crypto.id)}
            >
              <div className="flex items-center mb-2">
                <img src={crypto.image}
                alt={crypto.name}
                className="w-6 h-6 mr-2"/>
                <span className="font-semibold text-sm">
                  {crypto.symbol.toUpperCase()}
                </span>
              </div>
              <div className="text-lg font-bold">
                ${crypto.current_price.toLocaleString()}
              </div>
              <div className="text-sm">
                {formatPriceChange(crypto.price_change_percentage_24h)}
              </div>
            </div>
          )
        )
      }
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-lg shadow">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {cryptoData.find(c=> c.id === selectedCrypto)?.name || 'Bitcoin'}
            Price History
          </h2>

          <div className="flex space-x-2">
            {
              ['7', '30', '90'].map(
                (days)=> (
                  <button key={days}
                    onClick={()=> setTimeRange(days)}
                    className={`px-3 py-1 rounded text-sm
                    ${timeRange===days? 'bg-blue-600 text-white' :
                      'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }
                    `}>
                    {days}gg
                  </button>
                )
              )
            }
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={priceHistory}>
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis dataKey="date"/>
            <YAxis/>
            <Tooltip formatter={(value)=> [`$${value}`, 'Price']}/>
            <Line type="monotone" dataKey="price"
            stroke="#2563eb" strokeWidth={2} dot={false}/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Market Cap Comparison</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={cryptoData.slice(0,10)}>
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis dataKey="symbol"/>
            <YAxis tickFormatter={formatMarketCap}/>
            <Tooltip formatter={(value)=> [formatMarketCap(value), 'Market Cap']}/>
            <Bar dataKey="market_cap" fill="#2563eb"/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div className="bg-white rounded-lg mt-8 shadow overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Top10 Crypto</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Rank</th>
                <th className="text-left py-3 px-4">Nome</th>
                <th className="text-left py-3 px-4">Prezzo</th>
                <th className="text-left py-3 px-4">24h Change</th>
                <th className="text-left py-3 px-4">Market Cap</th>
              </tr>
            </thead>
            <tbody>
              {
                cryptoData.map( (crypto, index) => (
                  <tr key={crypto.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <img src={crypto.image} alt={crypto.name}
                        className="w-6 h-6 mr-3"/>
                        <div>
                          <div className="font-semibold"> {crypto.name} </div>
                          <div className="text-sm text-gray-500"> {crypto.symbol.toUpperCase()} </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold">${crypto.current_price.toLocaleString()}</td>
                    <td className="py-3 px-4">{formatPriceChange(crypto.price_change_percentage_24h)}</td>
                    <td className="py-3 px-4">{formatMarketCap(crypto.market_cap)}</td>
                  </tr>
                )
                )
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>


  </div>
</div>
)//fine return

}//fine dashboard
export default CryptoDashboard

