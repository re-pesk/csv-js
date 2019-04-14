## Converter from csv to json

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

Internal Data Object: 

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

JSON :

~~~
'{"header":["field_name_1","Field\\nName 2","field_name_3 "],"records":[["aaa","b \\n,bb","ccc\\"ddd"],["zzz",null,""],[1,2.2,null],[null,3,null]]}'
~~~

----

Parsinimo procesas suskirstytas į 5 funkcijas; makeRecords, checkRecords, checkValues, recordsToDataTree, makeDataTree

makeRecords(csvString: string) - grąžina masyvą, kurio kiekvienas elementas yra csv įrašas, o kiekvienas elemento elementas yra laukas, turintis keturias dalis, sudarytas iš dviejų elementų.
Funkcijos argumentai: 
  1) csvString - privaloma csv teksto eilutė.
Dalys yra tokios: 
  1) visas laukas ir jo pozicija pradiniame csv tekste, 
  2) separatorius ir jos pozicija lauke,
  3) validi lauko dalis ir jos pozicija lauke,
  4) nevalidi lauko dalis ir jos pozicija lauke.

ckeckRecords(recordSet: array, parameters := {}, functionName := '') - tikrina, ar įrašų masyvas turi teisingą struktūrą. 
Funkcijos argumentai: 
  1) recordSet - privalomas įrašų masyvas 
  2) parameters - neprivalomas { withEmptyLine: false }; jeigu parametras yra true, klaida nėra generuojama tuo atveju, kai paskutinis recordSet'o įrašas turi vienintelį tuščią lauką, t.y. csv eilutė baigiasi CrLf,
  3) functionName - neprivalomas funkcijos, kurioje inicijuota patikra, pavadinimas, jeigu parametras tuščias, klaidos pranešimuoise nurodoma funkcija 'checkRecords'.  

checkValues(recordSet array, parameters := {}, functionName := '') - tikrina, ar įrašų masyvo laukai nėra korumpuoti.
Funkcijos argumentai:
  1) recordSet - privalomas įrašų masyvas,
  2) parameters - neprivalomas { withHeader: false, withEmptyLine: false }: 
      jeigu withHeader === true, tikrinama ar pirmojo įrašo laukai nėra tušti; 
      jeigu withEmptyLine === true, klaida nėra generuojama tuo atveju, kai paskutinis recordSet'o įrašas turi vienintelį tuščią lauką, t.y. csv eilutė baigiasi CrLf,
  3) functionName - neprivalomas funkcijos, kurioje inicijuota patikra, pavadinimas, jeigu parametras tuščias, klaidos pranešimuoise nurodoma funkcija 'checkValues'.  

recordsToDataTree(recordSet : array, parameters = {}) - generuoja duomenų medį iš įrašų rinkinio pagal 'parameters' nustatymus, jeigu 'recordSet' argumentas turi teisingus duomenis.
Funkcijos argumentai:
  1) recordSet - įrašų masyvas (privalomas),
  2) parameters - neprivalomas { withHeader: false, withNull: false, withNumbers: false, withEmptyLine: false, ignoreCorruptedValues: false,  }:
      - jeigu withHeader === true, sugeneruotas duomenų medis turi atskirą šaką 'header', į kurią perkeliamas pirmasis įrašas;
      - jeigu withNull === true, sugeneruotame duomenų medyje visi tušti laukai be kabučių verčiami į null, išorinės kabutės pašalinamos, o vidinės dvigubos kabutės verčiamos viengubomis;
      - jeigu withNumbers === true, sugeneruotame duomenų medyje visų laikų rėikšmės, sudarytos tik iš skaitmenų, verčiamos į skaičius;
      - jeigu withEmptyLine === true, generuojama duomenų medžio šaka tuo atveju, kai paskutinis recordSet'o įrašas turi vienintelį tuščią lauką, t.y. csv eilutė baigiasi CrLf;
      - jeigu ignoreCorruptedValues === true, korumpuoti duomenys ignoruojami, priešingu atveju klaida generuojama visada, kai csv lauke aptinkami korumpuoti duomenys.

makeDataTree(csvString : string, parameters = {}) - generuoja duomenų medį iš tesktinės eilutės pagal 'parameters' nustatymus.
Funkcijos argumentai: 
  1) csvString - privaloma csv teksto eilutė.
  2) parameters - { withHeader: false, withNull: false, withNumbers: false, withEmptyLine: false, ignoreCorruptedValues: false,  }:
      - jeigu withHeader === true, sugeneruotas duomenų medis turi atskirą šaką 'header', į kurią perkeliamas pirmasis įrašas;
      - jeigu withNull === true, sugeneruotame duomenų medyje visi tušti laukai be kabučių verčiami į null, išorinės kabutės pašalinamos, o vidinės dvigubos kabutės verčiamos viengubomis;
      - jeigu withNumbers === true, sugeneruotame duomenų medyje visų laikų rėikšmės, sudarytos tik iš skaitmenų, verčiamos į skaičius;
      - jeigu withEmptyLine === true, generuojama duomenų medžio šaka tuo atveju, kai paskutinis recordSet'o įrašas turi vienintelį tuščią lauką, t.y. csv eilutė baigiasi CrLf;
      - jeigu ignoreCorruptedValues === true, korumpuoti duomenys ignoruojami, priešingu atveju klaida generuojama visada, kai csv lauke aptinkami korumpuoti duomenys.
