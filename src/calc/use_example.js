const input = "3+4*2-5/6";

var formula = new Formula(input);

formula.calculate()
>> "61/6"

formula.calculate({ toDemical: true })
>> "10.1'6'"

formula.calculate({ toApprox: true })
>> "10.166666..."

formula.register(
    factorial,
    gcd,    
    lcm
);

factorial = new Operator(
    '!',
    'factorial',
    PRIOR.MUL,
    Direction.RIGHT,
    factorial
);

function factorial(a) {
    return (a < 0) ? Infinity : (a == 0) ? 1 : a * factorial(a - 1);
}

function gcd(a, b) {
    return (!b) ? a : gcd(b, a % b);
}

function lcm(a, b) {
    return (a * b) / gcd(a, b);
}