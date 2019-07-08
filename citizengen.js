const ac = require("./geodata");
const pnames = require("./peoplenames");

const MONTH_CODES = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'H',
  'L',
  'M',
  'P',
  'R',
  'S',
  'T'
];

const CHECK_CODE_ODD = {
  0: 1,
  1: 0,
  2: 5,
  3: 7,
  4: 9,
  5: 13,
  6: 15,
  7: 17,
  8: 19,
  9: 21,
  A: 1,
  B: 0,
  C: 5,
  D: 7,
  E: 9,
  F: 13,
  G: 15,
  H: 17,
  I: 19,
  J: 21,
  K: 2,
  L: 4,
  M: 18,
  N: 20,
  O: 11,
  P: 3,
  Q: 6,
  R: 8,
  S: 12,
  T: 14,
  U: 16,
  V: 10,
  W: 22,
  X: 25,
  Y: 24,
  Z: 23
};

const CHECK_CODE_EVEN = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  A: 0,
  B: 1,
  C: 2,
  D: 3,
  E: 4,
  F: 5,
  G: 6,
  H: 7,
  I: 8,
  J: 9,
  K: 10,
  L: 11,
  M: 12,
  N: 13,
  O: 14,
  P: 15,
  Q: 16,
  R: 17,
  S: 18,
  T: 19,
  U: 20,
  V: 21,
  W: 22,
  X: 23,
  Y: 24,
  Z: 25
};

const OMOCODIA_TABLE = {
  0: 'L',
  1: 'M',
  2: 'N',
  3: 'P',
  4: 'Q',
  5: 'R',
  6: 'S',
  7: 'T',
  8: 'U',
  9: 'V'
};

const CHECK_CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';


class CodiceFiscale {
    
    get day() {
        return this.bdate.getDate()
    }
    set day(d) {
        this.bdate.setDate(d)
    }
    get month() {
        return this.bdate.getMonth() + 1
    }
    set month(m) {
        this.bdate.setMonth(m - 1)
    }
    get year() {
        return this.bdate.getFullYear()
    }
    set year(y) {
        this.bdate.setFullYear(y)
    }
    get cf() {
        return this.code
    }
    get nameCode() {
        return this.code.substr(3, 3)
    }
    get lastNameCode() {
        return this.code.substr(0, 3)
    }
    get checkCode() {
        return this.code.substr(15, 1)
    }
    
    constructor() {
        this.name = "";
        this.lastname = "";
        this.gender = "";
        this.bdate = undefined;
        this.bplace = {};
    }

    generate(cfdata) {
        let fcode;
        if (typeof cfdata === 'string') {
            if (CodiceFiscale.check(cfdata)) {
                this.code = cfdata;
                fcode = this.reverse();
            } else {
                throw new Error('Provided input is not a valid Codice Fiscale')
            }
        }
        else if (typeof cfdata === 'object') {
            // gender, name, lastname, birth_date, birth_place, bplace_region, cap, isee, nfam) {
            this.name = cfdata.name
            this.lastname = cfdata.lastname
            this.gender = this.checkGender(cfdata.gender)
            this.bdate = cfdata.bdate ? CodiceFiscale.getValidDate(cfdata.bdate) : CodiceFiscale.getValidDate(cfdata.day, cfdata.month, cfdata.year);
            this.bplace = ac.search(cfdata.bplace, cfdata.bplace_prov);
            fcode = this.compute();
        }
        else {
            throw new Error('Only a string or a proper data structure are allowed as input')
        }

        return fcode;
    }
    
    static daysInMonth(m, y) {
        switch (m) {
        case 1:
            return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0) ? 29 : 28
        case 8:
        case 3:
        case 5:
        case 10:
            return 30
        default:
            return 31
        }
    }
    
    static isValidDate(d, m, y) {
        const month = m - 1
        return month >= 0 && month < 12 && d > 0 && d <= CodiceFiscale.daysInMonth(month, y)
    }
    
    static getValidDate(d, m, y) {
        if (typeof d === 'string' && m === undefined && y === undefined) {
            return new Date(d.slice(3, 5) + "/" + d.slice(0, 3) + "/" + d.slice(6, 10));
        }
        else if (CodiceFiscale.isValidDate(d, m, y)) {
            return new Date(y, m - 1, d, 0, 0, 0, 0);
        }
        else {
            throw new Error(`The date ${y}/${m}/${d} is not a valid date`);
        }
    }

    static extract_vowels(str) {
        return str.replace(/[^AEIOU]/gi, '')
    }
    
    static extract_consonants(str) {
        return str.replace(/[^BCDFGHJKLMNPQRSTVWXYZ]/gi, '')
    }

    static getCheckCode(codiceFiscale) {
        codiceFiscale = codiceFiscale.toUpperCase();
        let val = 0
        for (let i = 0; i < 15; i = i + 1) {
            const c = codiceFiscale[i]
            val += i % 2 !== 0 ? CHECK_CODE_EVEN[c] : CHECK_CODE_ODD[c]
        }
        val = val % 26
        return CHECK_CODE_CHARS.charAt(val)
    }
    static findLocationCode(name, prov) {
        return new Comune(name, prov).cc
    }
    static computeInverse(codiceFiscale) {
        return new CodiceFiscale(codiceFiscale).toJSON()
    }
    static compute (obj) {
        return new CodiceFiscale(obj).toString()
    }
    static check(codiceFiscale) {
        if (typeof codiceFiscale !== 'string') {
            return false
        }
        let cf = codiceFiscale.toUpperCase()
        if (cf.length !== 16) {
            return false
        }
        const expectedCheckCode = codiceFiscale.charAt(15)
        cf = codiceFiscale.slice(0, 15)
        return CodiceFiscale.getCheckCode(cf).toUpperCase() === expectedCheckCode.toUpperCase();
    }
    
    static getOmocodie (cf) {
        return new CodiceFiscale(cf).omocodie()
    }
    
    static last_nameCode(lastname) {
        const codeLast_Name = `${CodiceFiscale.extract_consonants(lastname)}${CodiceFiscale.extract_vowels(lastname)}XXX`
        return codeLast_Name.substr(0, 3).toUpperCase()
    }
    static nameCode(name){
        let codNome = CodiceFiscale.extract_consonants(name)
        if (codNome.length >= 4) {
            codNome = codNome.charAt(0) + codNome.charAt(2) + codNome.charAt(3)
        }
        else {
            codNome += `${CodiceFiscale.extract_vowels(name)}XXX`
            codNome = codNome.substr(0, 3)
        }
        return codNome.toUpperCase()
    }
    static dateCode(day, month, year, gender){
        year = `0${year}`
        year = year.substr(year.length - 2, 2)
        month = MONTH_CODES[month-1];
        if (gender.toUpperCase() === 'F') {
            day += 40
        }
        day = `0${day}`
        day = day.substr(day.length - 2, 2)
        return `${year}${month}${day}`
    }
    toString () {
        return this.code
    }
    toJSON () {
        
        return {
            name: this.name,
            lastname: this.lastname,
            gender: this.gender,
            day : this.bdate.getDate(),
            year: this.bdate.getFullYear(),
            month: this.bdate.getMonth()+1, 
            bdate: this.bdate.toISOString().slice(0,10),
            bplace: this.bplace,
            cf: this.code
        }
    }
    isValid () {
        if (typeof this.code !== 'string') {
            return false
        }
        this.code = this.code.toUpperCase()
        if (this.code.length !== 16) {
            return false
        }
        const expectedCheckCode = this.code.charAt(15)
        const cf = this.code.slice(0, 15)
        return CodiceFiscale.getCheckCode(cf).toUpperCase() === expectedCheckCode.toUpperCase()
    }
    omocodie () {
        const results = []
        let lastOmocode = (this.code = this.code.slice(0, 15))
        for (let i = this.code.length - 1; i >= 0; i = i - 1) {
            const char = this.code[i]
            if (char.match(/\d/) !== null) {
                lastOmocode = `${lastOmocode.substr(0, i)}${OMOCODIA_TABLE[char]}${lastOmocode.substr(i + 1)}`
                results.push(lastOmocode + CodiceFiscale.getCheckCode(lastOmocode))
            }
        }
        return results
    }
    
    compute() {
        let code = this.getLastNameCode()
        code += this.getNameCode()
        code += this.dateCode()
        code += this.bplace.codcat
        code += CodiceFiscale.getCheckCode(code)
        return code;
    }
    
    reverse() {
        this.name = this.code.substr(3, 3)
        this.lastname = this.code.substr(0, 3)
        
        const yearCode = this.code.substr(6, 2)
        const year19XX = parseInt(`19${yearCode}`, 10)
        const year20XX = parseInt(`20${yearCode}`, 10)
        const currentYear20XX = new Date().getFullYear()
        const year = year20XX > currentYear20XX ? year19XX : year20XX
        const monthChar = this.code.substr(8, 1)
        const month = MONTH_CODES.indexOf(monthChar)
        this.gender = 'M'
        let day = parseInt(this.code.substr(9, 2), 10)
        if (day > 31) {
            this.gender = 'F';
            day = day - 40;
        }
        this.bdate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0))
        const cc = this.code.substr(11, 4);
        console.log("CC=" + cc);
        this.bplace = ac.search_by_codcat(cc).municip;
        return this.toJSON()
    }
    
    checkGender(gender) {
        this.gender = gender !== undefined ? gender.toUpperCase() : this.gender.toUpperCase()
        if (typeof this.gender !== 'string') {
            throw new Error('Gender must be a string')
        }
        if (this.gender !== 'M' && this.gender !== 'F') {
            throw new Error('Gender must be either \'M\' or \'F\'')
        }
        return gender
    }
    
    getLastNameCode() {
        return CodiceFiscale.last_nameCode(this.lastname);
    }
    
    getNameCode() {
        return CodiceFiscale.nameCode(this.name);
    }
    
    dateCode() {
        return CodiceFiscale.dateCode(this.bdate.getDate(), this.bdate.getMonth() + 1, this.bdate.getFullYear(), this.gender);
    }
}


class IdentityGenerator {
    static random_date(start, end) {
        let date = new Date(+start + Math.random() * (end - start));
        return date;
    }
    constructor() {
        this.sd = new Date(1920, 1, 1);
        this.ed = new Date();
        this.glist = [ 'f', 'm' ];
        this.max_isee_cat = 4;
        this.max_nfam = 6;
    }

    generate() {
        let bd = IdentityGenerator.random_date(this.sd, this.ed)
        let place = ac.get_random_place();
        let gender = this.glist[Math.floor(Math.random() * this.glist.length)];
        let idata = {
            gender: gender,
            name: pnames.data[gender][Math.floor(Math.random() * pnames.data[gender].length)],
            lastname: pnames.data.lnames[Math.floor(Math.random() * pnames.data.lnames.length)],
            bdate: bd.getDate().toString().padStart(2,'0')+"/"+(bd.getMonth()+1).toString().padStart(2, '0')+"/"+bd.getFullYear().toString().padStart(4, '0'),
            bplace: place.municip,
            bplace_prov: place.prov,
            bplace_region: place.region,
            cap: place.cap,
            isee: Math.floor(Math.random() * this.max_isee_cat + 1),
            nfam: Math.floor(Math.random() * this.max_nfam + 1)
        }
        return idata;
    }

}

module.exports = {
    CodiceFiscale,
    IdentityGenerator
}
