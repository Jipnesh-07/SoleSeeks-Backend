exports.adjustPriceByCondition = (originalPrice, condition) => {
    let factor = 1;
    if (condition === 'better') factor = 1.2;
    else if (condition === 'best') factor = 1.5;
    return originalPrice * factor;
};
