// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract MetaHive is ERC20, Ownable, ReentrancyGuard {
    mapping(address => bool) private _restricted;
    uint256 private _rate;
    uint256 private constant DECIMALS = 18;
    uint256 private constant TOTAL_SUPPLY = 22_000_000 * 10**DECIMALS;

    // Tracking contract's token and ETH balances
    uint256 private _contractTokenBalance;
    uint256 private _contractEthBalance;

    event RateChanged(uint256 oldRate, uint256 newRate);
    event AddressRestricted(address indexed addr, bool restricted);
    event EthDeposited(address indexed depositor, uint256 amount);
    event TokenSaleBalanceUpdated(uint256 tokenBalance, uint256 ethBalance);

    constructor() ERC20("MetaHive", "MHI") Ownable(msg.sender) {
        // Mint tokens directly to the contract instead of owner
        _mint(address(this), TOTAL_SUPPLY);
        
        // Set initial contract token balance
        _contractTokenBalance = TOTAL_SUPPLY;
        
        // Set initial rate
        _rate = 10000; // 10000 tokens per 1 ETH
    }

    function sell(uint256 tokenAmount) external nonReentrant {
    require(tokenAmount > 0, "Amount must be > 0");
    require(balanceOf(msg.sender) >= tokenAmount, "Insufficient token balance");
    
    // Calculate ETH amount with proper precision
    // Convert token amount to base units (no decimals), then calculate ETH amount
    uint256 etherAmount = (tokenAmount * 1e18) / (_rate * (10 ** DECIMALS));
    
    // Check contract's ETH balance
    require(address(this).balance >= etherAmount, "Contract has insufficient ETH balance");
    
    // Transfer tokens from seller to contract first
    _transfer(msg.sender, address(this), tokenAmount);
    
    // Update contract's token balance
    _contractTokenBalance += tokenAmount;
    
    // Transfer ETH to the seller
    (bool success, ) = payable(msg.sender).call{value: etherAmount}("");
    require(success, "ETH transfer failed");
    
    // Update contract's ETH balance after successful transfer
    _contractEthBalance -= etherAmount;
    
    emit TokenSaleBalanceUpdated(_contractTokenBalance, _contractEthBalance);
}


    receive() external payable {
        _contractEthBalance += msg.value;
        emit EthDeposited(msg.sender, msg.value);
        emit TokenSaleBalanceUpdated(_contractTokenBalance, _contractEthBalance);
    }

    function buy() external payable nonReentrant {
        require(msg.value > 0, "ETH amount must be > 0");
        
        // Calculate token amount
        uint256 tokenAmount = msg.value * _rate;
        
        // Check if contract has enough tokens
        require(_contractTokenBalance >= tokenAmount, "Insufficient tokens in contract");
        
        // Update contract balances
        _contractTokenBalance -= tokenAmount;
        _contractEthBalance += msg.value;
        
        // Transfer tokens to buyer
        _transfer(address(this), msg.sender, tokenAmount);
        
        emit TokenSaleBalanceUpdated(_contractTokenBalance, _contractEthBalance);
    }

    function getContractTokenBalance() external view returns (uint256) {
        return _contractTokenBalance;
    }

    function getContractEthBalance() external view returns (uint256) {
        return _contractEthBalance;
    }

    function withdrawExcessFunds(uint256 tokenAmount, uint256 ethAmount) external onlyOwner {
        if (tokenAmount > 0) {
            require(tokenAmount <= _contractTokenBalance, "Insufficient token balance");
            _transfer(address(this), owner(), tokenAmount);
            _contractTokenBalance -= tokenAmount;
        }
        if (ethAmount > 0) {
            require(ethAmount <= _contractEthBalance, "Insufficient ETH balance");
            payable(owner()).transfer(ethAmount);
            _contractEthBalance -= ethAmount;
        }

        emit TokenSaleBalanceUpdated(_contractTokenBalance, _contractEthBalance);
    }

    function setConversionRate(uint newRate) external onlyOwner {
        require(newRate > 0, "Rate must be > 0");
        uint256 oldRate = _rate;
        _rate = newRate;
        emit RateChanged(oldRate, newRate);
    }

    function restrictAddress(address addr) external onlyOwner {
        _restricted[addr] = true;
        emit AddressRestricted(addr, true);
    }

    function unRestrictAddress(address addr) external onlyOwner {
        _restricted[addr] = false;
        emit AddressRestricted(addr, false);
    }

    function isRestricted(address addr) external view returns (bool) {
        return _restricted[addr];
    }

    function getConversionRate() external view returns (uint) {
        return _rate;
    }

    function _update(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        require(!_restricted[from], "From address is restricted");
        require(!_restricted[to], "To address is restricted");
        super._update(from, to, amount);
    }
}