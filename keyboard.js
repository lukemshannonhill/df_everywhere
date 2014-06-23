
//Load Mousetrap t
src="mousetrap.min.js"

function sendKey(toSend) {
    //Just send the text string, the server handles checking its validity
    connection.send("df_everywhere.g1.commands", toSend);
}

Mousetrap.bind({
    'a': function() { sendKey('a'); },
    'b': function() { sendKey('b'); },
    'c': function() { sendKey('c'); },
    'd': function() { sendKey('d'); },
    'e': function() { sendKey('e'); },
    'f': function() { sendKey('f'); },
    'g': function() { sendKey('g'); },
    'h': function() { sendKey('h'); },
    'i': function() { sendKey('i'); },
    'j': function() { sendKey('j'); },
    'k': function() { sendKey('k'); },
    'l': function() { sendKey('l'); },
    'm': function() { sendKey('m'); },
    'n': function() { sendKey('n'); },
    'o': function() { sendKey('o'); },
    'p': function() { sendKey('p'); },
    'q': function() { sendKey('q'); },
    'r': function() { sendKey('r'); },
    's': function() { sendKey('s'); },
    't': function() { sendKey('t'); },
    'u': function() { sendKey('u'); },
    'v': function() { sendKey('v'); },
    'w': function() { sendKey('w'); },
    'x': function() { sendKey('x'); },
    'y': function() { sendKey('y'); },
    'z': function() { sendKey('z'); },
    'A': function() { sendKey('A'); },
    'B': function() { sendKey('B'); },
    'C': function() { sendKey('C'); },
    'D': function() { sendKey('D'); },
    'E': function() { sendKey('E'); },
    'F': function() { sendKey('F'); },
    'G': function() { sendKey('G'); },
    'H': function() { sendKey('H'); },
    'I': function() { sendKey('I'); },
    'J': function() { sendKey('J'); },
    'K': function() { sendKey('K'); },
    'L': function() { sendKey('L'); },
    'M': function() { sendKey('M'); },
    'N': function() { sendKey('N'); },
    'O': function() { sendKey('O'); },
    'P': function() { sendKey('P'); },
    'Q': function() { sendKey('Q'); },
    'R': function() { sendKey('R'); },
    'S': function() { sendKey('S'); },
    'T': function() { sendKey('T'); },
    'U': function() { sendKey('U'); },
    'V': function() { sendKey('V'); },
    'W': function() { sendKey('W'); },
    'X': function() { sendKey('X'); },
    'Y': function() { sendKey('Y'); },
    'Z': function() { sendKey('Z'); },
    '0': function() { sendKey('0'); },
    '1': function() { sendKey('1'); },
    '2': function() { sendKey('2'); },
    '3': function() { sendKey('3'); },
    '4': function() { sendKey('4'); },
    '5': function() { sendKey('5'); },
    '6': function() { sendKey('6'); },
    '7': function() { sendKey('7'); },
    '8': function() { sendKey('8'); },
    '9': function() { sendKey('9'); },
    '!': function() { sendKey('!'); },
    '"': function() { sendKey('"'); },
    '#': function() { sendKey('#'); },
    '$': function() { sendKey('$'); },
    '%': function() { sendKey('%'); },
    '&': function() { sendKey('&'); },
    ''': function() { sendKey('''); },
    '(': function() { sendKey('('); },
    ')': function() { sendKey(')'); },
    '*': function() { sendKey('*'); },
    '+': function() { sendKey('+'); },
    ',': function() { sendKey(','); },
    '-': function() { sendKey('-'); },
    '.': function() { sendKey('.'); },
    '/': function() { sendKey('/'); },
    ':': function() { sendKey(':'); },
    ';': function() { sendKey(';'); },
    '<': function() { sendKey('<'); },
    '=': function() { sendKey('='); },
    '>': function() { sendKey('>'); },
    '?': function() { sendKey('?'); },
    '@': function() { sendKey('@'); },
    '[': function() { sendKey('['); },
    '\': function() { sendKey('\'); },
    ']': function() { sendKey(']'); },
    '^': function() { sendKey('^'); },
    '_': function() { sendKey('_'); },
    '`': function() { sendKey('`'); },
    '{': function() { sendKey('{'); },
    '|': function() { sendKey('|'); },
    '}': function() { sendKey('}'); },
    '~': function() { sendKey('~'); }
});