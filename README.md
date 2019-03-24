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

JSON :

~~~
{
    "header": [
        "field_name_1",
        "Field\nName 2",
        "field_name_3 "
    ],
    "records": [
        [
            "aaa",
            "b \n,bb",
            "ccc\"ddd"
        ],
        [
            "zzz",
            "",
            ""
        ],
        [
            1,
            2.2,
            ""
        ],
        [
            "",
            3,
            ""
        ]
    ]
}
~~~