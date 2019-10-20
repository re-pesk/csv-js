## Converter from csv to json 
In accordance with [RFC 4180](https://tools.ietf.org/html/rfc4180)

CSV:

~~~
`field_name_1,"Field
Name 2",field_name_3 
"aaa","b 
,bb","ccc""ddd"
zzz,,""
1,2.2,
,3,
`
~~~

RecordSet:

~~~
[
  [
    [["field_name_1",0],["",0],["field_name_1",0],["",12]],
    [[",\"Field\r\nName 2\"",12],[",",0],["\"Field\r\nName 2\"",1],["",16]],
    [[",field_name_3 ",28],[",",0],["field_name_3 ",1],["",14]]
  ],[
    [["\r\n\"aaa\"",42],["\r\n",0],["\"aaa\"",2],["",7]],
    [[",\"b \r\n,bb\"",49],[",",0],["\"b \r\n,bb\"",1],["",10]],
    [[",\"ccc\"\"ddd\"",59],[",",0],["\"ccc\"\"ddd\"",1],["",11]]
  ],[
    [["\r\nzzz",70],["\r\n",0],["zzz",2],["",5]],
    [[",",75],[",",0],["",1],["",1]],
    [[",\"\"",76],[",",0],["\"\"",1],["",3]]
  ],[
    [["\r\n1",79],["\r\n",0],["1",2],["",3]],
    [[",2.2",82],[",",0],["2.2",1],["",4]],
    [[",",86],[",",0],["",1],["",1]]
  ],[
    [["\r\n",87],["\r\n",0],["",2],["",2]],
    [[",3",89],[",",0],["3",1],["",2]],
    [[",",91],[",",0],["",1],["",1]]
  ],[
    [["\r\n",92],["\r\n",0],["",2],["",2]]
  ]
]
~~~

Created Data Object: 

~~~
{
  header: ['field_name_1', 'Field\nName 2', 'field_name_3'],
  records: [
    ['aaa', 'b \n,bb', 'ccc"ddd'],
    ['zzz', null, ''],
    [1, 2.2, null],
    [null, 3, null],
  ],
}
~~~

JSON string:

~~~
'{"header":["field_name_1","Field\\nName 2","field_name_3 "],"records":[["aaa","b \\n,bb","ccc\\"ddd"],["zzz",null,""],[1,2.2,null],[null,3,null]]}'
~~~

----

Parsinimo procesas suskirstytas į 5 funkcijas: makeRecords, checkRecords, checkValues, recordsToDataTree, makeDataTree.

**makeRecords(csvString : string)** - grąžina masyvą, kurio kiekvienas elementas yra csv įrašas, o kiekvienas elemento elementas yra laukas, turintis keturias dalis, sudarytas iš dviejų elementų.
Funkcijos argumentai: 
1. csvString - privaloma csv teksto eilutė.

Lauko dalys yra tokios: 
1. visas laukas ir jo pozicija pradiniame csv tekste, 
2. separatorius ir jos pozicija lauke,
3. validi lauko dalis ir jos pozicija lauke,
4. nevalidi lauko dalis ir jos pozicija lauke.

**ckeckRecords(recordSet : array, parameters := {}, functionName := '')** - tikrina, ar įrašų masyvas turi teisingą struktūrą. 
Funkcijos argumentai: 
1. recordSet - privalomas įrašų masyvas 
2. parameters - neprivalomas { preserveEmptyLine: false }; jeigu parametras yra true, klaida nėra generuojama tuo atveju, kai paskutinis recordSet'o įrašas turi vienintelį tuščią lauką, t.y. csv eilutė baigiasi CrLf,
3. functionName - neprivalomas funkcijos, kurioje inicijuota patikra, pavadinimas; jeigu parametras tuščias, klaidos pranešimuose nurodoma funkcija 'checkRecords'.  

**checkValues(recordSet : array, parameters := {}, functionName := '')** - tikrina, ar įrašų masyvo laukuose nėra klaidingų simbolių.
Lauke negali būti:
1. dvigubų kabučių, jeigu laukas prasideda kitu simboliu, nei dvigubos kabutės;
2. jokių simbolių po antrųjų dvigubų kabučių, prieš kurias nėra kairinio brūkšnio (angl. *backslash*), jeigu laukas prasideda dvigubomis kabutėmis.
   
Funkcijos argumentai:
1. recordSet - privalomas įrašų masyvas,
2. parameters - neprivalomas { hasHeader: false, preserveEmptyLine: false }: 
  * jeigu hasHeader === true, tikrinama ar pirmojo įrašo laukai nėra tušti; 
  * jeigu preserveEmptyLine === true, klaida nėra generuojama tuo atveju, kai paskutinis recordSet'o įrašas turi vienintelį tuščią lauką, t.y. csv eilutė baigiasi CrLf,
3. functionName - neprivalomas funkcijos, kurioje inicijuota patikra, pavadinimas; jeigu parametras tuščias, klaidos pranešimuose nurodoma funkcija 'checkValues'.  

**recordsToDataTree(recordSet : array, parameters = {})** - generuoja duomenų medį iš įrašų rinkinio pagal 'parameters' nustatymus, jeigu 'recordSet' argumentas turi teisingus duomenis.
Funkcijos argumentai:
1. recordSet - įrašų masyvas (privalomas),
2. parameters - neprivalomas { hasHeader: false, convertToNull: false, convertToNumber: false, preserveEmptyLine: false, ignoreInvalidChars: false }:
  * jeigu hasHeader === true, sugeneruotas duomenų medis turi atskirą šaką 'header', į kurią perkeliamas pirmasis įrašas;
  * jeigu convertToNull === true, sugeneruotame duomenų medyje visi tušti laukai be kabučių verčiami į null, išorinės kabutės pašalinamos, o vidinės dvigubos kabutės verčiamos viengubomis;
  * jeigu convertToNumber === true, sugeneruotame duomenų medyje visų laukų reikšmės, sudarytos tik iš skaitmenų, verčiamos į skaičius;
  * jeigu preserveEmptyLine === true, generuojama duomenų medžio šaka tuo atveju, kai paskutinis recordSet'o įrašas turi vienintelį tuščią lauką, t.y. csv eilutė baigiasi CrLf;
  * jeigu ignoreInvalidChars === true, lauko reikšmė generuojama iš leidžiamų simbolių, klaidingus simbolius ignoruojant, priešingu atveju klaida generuojama visada, kai csv lauke aptinkami klaidingi simboliai.

**makeDataTree(csvString : string, parameters = {})** - generuoja duomenų medį iš tekstinės eilutės pagal 'parameters' nustatymus.
Funkcijos argumentai: 
1. csvString - privaloma csv teksto eilutė.
2. parameters - { hasHeader: false, convertToNull: false, convertToNumber: false, preserveEmptyLine: false, ignoreInvalidChars: false }:
  * jeigu hasHeader === true, sugeneruotas duomenų medis turi atskirą šaką 'header', į kurią perkeliamas pirmasis įrašas;
  * jeigu convertToNull === true, sugeneruotame duomenų medyje visi tušti laukai be kabučių verčiami į null, išorinės kabutės pašalinamos, o vidinės dvigubos kabutės verčiamos viengubomis;
  * jeigu convertToNumber === true, sugeneruotame duomenų medyje visų laukų reikšmės, sudarytos tik iš skaitmenų, verčiamos į skaičius;
  * jeigu preserveEmptyLine === true, generuojama duomenų medžio šaka tuo atveju, kai paskutinis recordSet'o įrašas turi vienintelį tuščią lauką, t.y. csv eilutė baigiasi CrLf;
  * jeigu ignoreInvalidChars === true, lauko reikšmė generuojama iš leidžiamų simbolių, klaidingus simbolius ignoruojant, priešingu atveju klaida generuojama visada, kai csv lauke aptinkami klaidingi simboliai.

### Programmos vykdymas

1. Suinstaliuoti *node.js*, *npm* ir *git*.
2. Klonuoti repozitoriją į lokalų diską:
  ~~~
  git clone https://github.com/re-pe/csv-js.git
  ~~~
3. Repozitorijos kataloge įvykdyti komandą, instaliuojančią reikalingus paketus:
  ~~~
  cd csv-js
  npm install
  ~~~
4. Paleisti testus:
  ~~~
  npm test
  ~~~
5. Paleisti programą:
  ~~~
  npm start
  ~~~
  