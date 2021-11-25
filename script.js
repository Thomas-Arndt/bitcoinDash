const COINGECKO_API = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin';

var currentPrice;

var categoryInformation = {
    market: "Bitcoin current price and 24-hour changes"
}

function roundTo(number, place){
    var multiplier = Math.pow(10, place);
    return Math.round(number*multiplier)/multiplier;
}

function convertTimestamp(timestamp){
    var date = new Date(timestamp*1000);
    var year = date.getFullYear();
    var month = date.getMonth()+1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    return year+"-"+month+"-"+day+" @ "+hour+":"+minute;
}

function showInfo(element, infoId){
    var infoBlock = document.getElementById(infoId+"-info");
    if(infoBlock.style.display == ""){
        infoBlock.style.display = "block";
        element.classList.remove("row-underline");
    }
    else if(infoBlock.style.display == "block"){
        infoBlock.style.display = "";
        if(!element.classList.contains("nul")){
            element.classList.add("row-underline");
        }

    }
}



// ************************API Calls************************

// COINGECKO API

fetch(COINGECKO_API)
.then( response => response.json() )
.then( response => {
    console.log(response);

    // currentMarket Categorys
    currentPrice = roundTo(response[0].current_price, 2);
    document.getElementById("price-usd").innerText = "$"+currentPrice.toLocaleString('en-US');
    var change = Math.round(response[0].price_change_24h);
    document.getElementById("usd-change-day").innerText = "$"+change.toLocaleString('en-US');
    document.getElementById("percent-change-day").innerText = roundTo(response[0].price_change_percentage_24h, 2)+"%";
    document.getElementById("sats-per-usd").innerText = Math.round(((10**8)/response[0].current_price)).toLocaleString('en-US');

    var marketCap = response[0].fully_diluted_valuation;
    if(marketCap > (10**12)){
        marketCap /= (10**12);
        marketCap = roundTo(marketCap, 2);
        var quantifier = " T";
    }
    else if(marketCap > (10**9)){
        marketCap /= (10**9);
        marketap = roundTo(marketCap, 2);
        var quantifier = " B";
    }
    document.getElementById("market-cap").innerText = "$"+marketCap.toLocaleString('en-US')+quantifier;

    if(change > 0){
        document.getElementById("usd-change-day").style.color = "green";
        document.getElementById("percent-change-day").style.color = "green";
        document.getElementById("current-market-title").classList.add("green-glow");
        document.getElementById("current-market-title").classList.remove("red-glow");
        document.getElementById("current-market-data").classList.add("green-glow");
        document.getElementById("current-market-data").classList.remove("red-glow");
    }
    else if(change < 0){
        document.getElementById("usd-change-day").style.color = "red";
        document.getElementById("percent-change-day").style.color = "red";
        document.getElementById("current-market-title").classList.add("red-glow");
        document.getElementById("current-market-title").classList.remove("green-glow");
        document.getElementById("current-market-data").classList.add("red-glow");
        document.getElementById("current-market-data").classList.remove("green-glow");
    }

    // allTimeHigh Category
    document.getElementById("ath-price").innerText = "$"+(response[0].ath).toLocaleString('en-US');
    document.getElementById("percent-change-ath").innerText = roundTo(response[0].ath_change_percentage, 2)+"%";

    if(response[0].ath_change_percentage > 0){
        document.getElementById("percent-change-ath").style.color = "green";
        document.getElementById("ath-title").classList.add("green-glow");
        document.getElementById("ath-title").classList.remove("red-glow");
        document.getElementById("ath-data").classList.add("green-glow");
        document.getElementById("ath-data").classList.remove("red-glow");
    }
    else if(response[0].ath_change_percentage < 0){
        document.getElementById("percent-change-ath").style.color = "red";
        document.getElementById("ath-title").classList.add("red-glow");
        document.getElementById("ath-title").classList.remove("green-glow");
        document.getElementById("ath-data").classList.add("red-glow");
        document.getElementById("ath-data").classList.remove("green-glow");
    }

    // blockChain Category
    document.getElementById("total-issued").innerText = (response[0].circulating_supply).toLocaleString('en-US')+" btc";
    var percentIssued = (response[0].circulating_supply/response[0].max_supply)*100;
    document.getElementById("percent-issued").innerText = roundTo(percentIssued, 2)+"%";

    // stockToFlow Category
    var stock = response[0].circulating_supply;
    var subsidy = 6.25;
    var flow = subsidy*6*24*365.25;
    var s2f = (stock-(10**6))/flow;
    var s2fModelPrice = Math.round(Math.exp(-1.84)*(s2f**3.36));
    var s2fMultiple = (currentPrice-s2fModelPrice)/s2fModelPrice;

    document.getElementById("stock").innerText = stock.toLocaleString('en-US')+" btc";
    document.getElementById("stock-flow").innerText = roundTo(s2f, 1);
    document.getElementById("stock-flow-price").innerText = "$"+s2fModelPrice.toLocaleString('en-US');
    document.getElementById("stock-flow-multiple").innerText = roundTo(s2fMultiple, 2);

    if(s2fMultiple > 0){
        document.getElementById("stock-flow-multiple").style.color = "green";
    }
    else if(s2fMultiple < 0){
        document.getElementById("stock-flow-multiple").style.color = "red";
    }

});


// MEMPOOL.SPACE API

const init = async () => {

    const { bitcoin: { difficulty } } = mempoolJS({ hostname: 'mempool.space' });

    const { bitcoin: { mempool } } = mempoolJS({ hostname: 'mempool.space' });

    const { bitcoin: { blocks } } = mempoolJS({ hostname: 'mempool.space' });

    const { bitcoin: { fees } } = mempoolJS({ hostname: 'mempool.space' });

    const difficultyAdjustment = await difficulty.getDifficultyAdjustment();

    const getMempool = await mempool.getMempool();

    const blocksTipHash = await blocks.getBlocksTipHash();

    const blocksTipHeight = await blocks.getBlocksTipHeight();

    const feesMempoolBlocks = await fees.getFeesMempoolBlocks();

    const feesRecommended = await fees.getFeesRecommended();

    const hash = blocksTipHash;

    const block = await blocks.getBlock({ hash });

    console.log(difficultyAdjustment);
    console.log(getMempool);
    console.log("tip Hash "+blocksTipHash);
    console.log("tip height "+blocksTipHeight);
    console.log(feesMempoolBlocks);
    console.log(feesRecommended);
    console.log(block);

    // mempoolStatus Category
    document.getElementById("mempool-total-transactions").innerText = (getMempool.count).toLocaleString('en-US');;
    document.getElementById("mempool-total-fees-btc").innerText = roundTo((getMempool.total_fee/10**8), 2)+" btc";
    document.getElementById("mempool-total-fees-usd").innerText = "$"+Math.round(((getMempool.total_fee*currentPrice)/10**8)).toLocaleString('en-US');

    // feesPriority Category
    document.getElementById("low-priority-fee").innerText = feesRecommended.hourFee+" sat/vB";
    document.getElementById("medium-priority-fee").innerText = feesRecommended.halfHourFee+" sat/vB";
    document.getElementById("high-priority-fee").innerText = feesRecommended.fastestFee+" sat/vB";

    document.getElementById("minimum-fee").innerText = feesRecommended.minimumFee+" sat/vB";

    // difficultyAdjustment Category
    var adjustment = roundTo(difficultyAdjustment.difficultyChange, 2);
    var previousAdjustment = roundTo(difficultyAdjustment.previousRetarget, 2);
    var averageTimeMinutes = Math.floor(difficultyAdjustment.timeAvg/60);
    var averageTimeSeconds = Math.floor(((difficultyAdjustment.timeAvg/60)-averageTimeMinutes)*60);
    if(averageTimeSeconds < 10){
        averageTimeSeconds = averageTimeSeconds.toString().padStart(2, 0);
    }
    var tMinus = Math.ceil(difficultyAdjustment.remainingTime/86400);

    if(adjustment > 0){
        document.getElementById("estimated-adjustment").style.color = "green";
    }
    else if(adjustment < 0){
        document.getElementById("estimated-adjustment").style.color = "red";
    }
    if(previousAdjustment > 0){
        document.getElementById("previous-adjustment").style.color = "green";
    }
    else if(previousAdjustment < 0){
        document.getElementById("previous-adjustment").style.color = "red";
    }

    document.getElementById("estimated-adjustment").innerText = adjustment+"%";
    document.getElementById("previous-adjustment").innerText = previousAdjustment+"%";
    document.getElementById("average-block-time").innerText = averageTimeMinutes+":"+averageTimeSeconds;
    document.getElementById("remaining-blocks").innerText = (difficultyAdjustment.remainingBlocks).toLocaleString('en-US');
    document.getElementById("remaining-time").innerText = "~"+tMinus+" day(s)";

    // nextBlock Category
    var reward = 6.25+roundTo((feesMempoolBlocks[0].totalFees/10**8), 2);

    document.getElementById("next-block-size").innerText = roundTo(feesMempoolBlocks[0].blockSize/(1000**2), 2)+"MB";
    document.getElementById("next-block-total-transactions").innerText = (feesMempoolBlocks[0].nTx).toLocaleString('en-US');
    document.getElementById("next-block-total-fees").innerText = roundTo((feesMempoolBlocks[0].totalFees/10**8), 2)+" btc";
    document.getElementById("next-block-reward").innerText = reward+" btc";
    document.getElementById("next-block-average-fee").innerText = "~"+Math.round(feesMempoolBlocks[0].medianFee)+" sat/vB";

    var feeRange = feesMempoolBlocks[0].feeRange;
    var lowFee = Math.round(feeRange[0]);
    var highFee = Math.round(feeRange[feeRange.length-1]);
    document.getElementById("next-block-fee-range").innerText = lowFee+" - "+highFee+" sat/vB";

    // lastBlock Category
    document.getElementById("last-block-height").innerText = (block.height).toLocaleString('en-US');
    document.getElementById("last-block-size").innerText = roundTo(block.size/(1000**2), 2)+" MB";
    document.getElementById("last-block-transactions").innerText = (block.tx_count).toLocaleString('en-US');
    document.getElementById("last-block-timestamp").innerText = convertTimestamp(block.timestamp);

    // blockChain Category
    document.getElementById("blockchain-height").innerText = (block.height).toLocaleString('en-US');
    document.getElementById("block-subsidy").innerText = "6.25 btc";
};
init();


