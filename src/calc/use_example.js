const input = "3+4*2-5/6";

var formula = new Formula(input);

formula.calculate()
>> "61/6"

formula.calculate({ toDemical: true })
>> "10.1'6'"

formula.calculate({ toApprox: true })
>> "10.166666..."

formula.register(
    combination,
    factorial,
    gcd,
    lcm
);

factorial = new Operator(
    '!',
    'factorial',
    PRIOR.MUL,
    Direction.RIGHT,
    a => a == 0 ? 1 : a * factorial(a - 1)
);
factorial = a => a == 0 ? 1 : a * factorial(a - 1);
combination = (a, b) => factorial(a) / (factorial(b) * factorial(a - b));

gcd = (a, b) => (!b) ? 1 : gcd(b, a % b);
lcm = (a, b) => (a * b) / gcd(a, b);