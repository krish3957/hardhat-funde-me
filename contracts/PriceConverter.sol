// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getPrice(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        AggregatorV3Interface dataFeed = priceFeed;
        (, int256 answer, , , ) = dataFeed.latestRoundData();
        //ETH in USD
        return uint256(answer * 1e10);
    }

    function getVersion() internal view returns (uint256) {
        AggregatorV3Interface dataFeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
        return dataFeed.version();
    }

    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        uint256 totalETHINUSD = (ethPrice * ethAmount) / 1e18;
        return totalETHINUSD;
    }
}
