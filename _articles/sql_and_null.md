---
title: SQL a NULL
layout: article
date: 2025-02-25
---

Jak v SQL porovnáváme NULL hodnoty? Opravdu si vystačíme s `IS (NOT) NULL`? Nemůže nás `NULL` nemile překvapit?

Mnozí si jistě pamatují ze škol či různých školení a studijních materiálů, že si na NULL v SQL máme dát pozor, protože se může chovat... "neintuitivně". Co to ale znamená?

Vytvořme si jednoduchou tabulku a rovnou přidáme nějaká data

```sql
CREATE TABLE stuff (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    source VARCHAR(10)
);

INSERT INTO stuff (name, source) VALUES
('Alice', 'phone'),
('Bob', NULL),
('Charlie', 'phone'),
('David', NULL),
('Eve', 'web'),
('Frank', 'email'),
('Grace', 'web'),
('Hank', 'phone'),
('Ivy', 'email'),
('Jack', NULL);
```

Tedy mějme tuto jednoduchou tabulku

| name    | source |
| ------- | ------ |
| Alice   | phone  |
| Bob     |        |
| Charlie | phone  |
| David   |        |
| Eve     | web    |
| Frank   | email  |
| Grace   | web    |
| Hank    | phone  |
| Ivy     | email  |
| Jack    |        |

Aneb seznam lidí a nějaký string "source", kde máme hodnoty `phone`, `web`, `email` a _nic_. Řekněme, že je to seznam leadů a jak jsme k nim přišli. Tam, kde není zdroj vyplněn jednoduše nevíme.

Začneme pomalu. Chceme osoby, které mají zdroj `email`

```sql
SELECT * FROM stuff WHERE source = 'email'
```

| name  | source |
| ----- | ------ |
| Frank | email  |
| Ivy   | email  |

Super. Funguje. Takto brzo asi nechceme něco rozbitého.

Pravděpodobně jsme se někde dozvěděli, že si máme dát pozor na `NULL`. Nikdy bychom neměli přímo porovnávat proti NULL. Proč?

```sql
SELECT * FROM stuff where source = NULL
```

Nic se nevrátí. No ale v tabulce máme záznamy s prázdnou hodnotou. Kde je Bob, David a Jack? Proč se nic nevrátilo?

Protože NULL není roven NULL. ... hm? Pojďme si trochu zaexperimentovat. Použijeme jednoduchý select a podíváme se, jak vypadají booleany.

```sql
select true as result;

 result
--------
 t

```

Ok. True je "t" a False bude "f". Co `NULL`?

```sql
select NULL as result;

 result
--------

```

Nic. Tedy `NULL`. Dobře. To zatím nic nevysvětluje a jen jsme si ukázali jak používat select. Začneme porovnávat.

```sql
select true = true as result;

 result
--------
 t
```

```sql
select 'web' = 'web' as result;

 result
--------
 t
```

```sql
select 'web' = 'email' as result;

 result
--------
 f
```

```sql
select true = false as result;

 result
--------
 f
```

Dobrý. Booleany a Stringy je možné porovnávat a výsledky nás nepřekvapí. Přidáme `NULL`.

```sql
select false = NULL as result;

 result
--------

```

```sql
select NULL = true as result;

 result
--------

```

```sql
select 'web' = NULL as result;

 result
--------

```

Divný. Ale proč ne. Jakmile se nám v operandech objeví NULL, tak se výsledek "vyNULLuje". Co `NULL` sám se sebou?

```sql
select NULL = NULL as result;

 result
--------

```

Ohh. Takže "NULLování" platí i pro takový případ. Ok. To je poměrně důležité.

Aby dotaz vrátil řádek, musí podmínka vrátit `true` (`t`). Cokoliv jiného řádek odfiltruje. Tedy pokud vyjde`false`, podmínka neplatí a logicky se řádek nevrátí. Pokud ale vyjde `NULL`, znamená to, že je výsledek "neznámý" a řádek se také nevrátí.

Proto nás asi všechny možné kurzy učí `IS NULL`

```sql
SELECT name, source FROM stuff WHERE source IS NULL;
```

| name  | source |
| ----- | ------ |
| Bob   |        |
| David |        |
| Jack  |        |

Super. To funguje! Máme osoby bez vyplněného `source`. Samozřejmě můžeme použít negaci a najít řádky, které mají `source` vyplněn.

```sql
SELECT name, source FROM stuff WHERE source IS NOT NULL;
```

| name    | source |
| ------- | ------ |
| Alice   | phone  |
| Charlie | phone  |
| Eve     | web    |
| Frank   | email  |
| Grace   | web    |
| Hank    | phone  |
| Ivy     | email  |

Opět funguje. Ještě aby ne.

Obvykle dostaneme poučení z kurzu: Pro porovnání s `NULL` používejte `IS NULL` a `IS NOT NULL`. A je to pravda. Ukázali jsme si, že obyčejné porovnání (`=`) nefunguje úplně nejlépe.

A tím to skončí. Hotovo. Problém s `NULL` je vyřešen. Víme, že nemáme používat porovnání s `NULL`. Yay

Tak si sedneme ke svým tabulkám a začneme vesele bouchat dotazy. Jeden z nich je dokonce velmi podobný první ukázce:

```text
Vyber všechny osoby, které jsou z telefonické kampaně
```

Jednoduché. Nic s `NULL`, takže jsem v pohodě.

```sql
SELECT name, source FROM stuff WHERE source = 'phone';
```

| name    | source |
| ------- | ------ |
| Alice   | phone  |
| Charlie | phone  |
| Hank    | phone  |

A to je v pořádku. Všichni jsou spokojeni.

Nyní bychom chtěli opačný výsledek. Aneb přijde zadání:

```text
Vyber všechny osoby, které NEjsou z telefonické kampaně.
```

Řeknete si. Dobře, to je přece "super easy, barely an inconvenience". Doslova negace výrazu! Opět neporovnáváme s `NULL`, takže pohoda.

```sql
SELECT name, source FROM stuff WHERE source != 'phone';
```

| name  | source |
| ----- | ------ |
| Eve   | web    |
| Frank | email  |
| Grace | web    |
| Ivy   | email  |

Dostal jsem výsledek, nejsou tam záznamy s 'phone'. To vypadá dobře. Všichni jsou spokojeni... Dokud se nepodíváme pořádně.

Pokud spojíme 2 předchozí výsledky, dostaneme

```sql

SELECT name, source FROM stuff WHERE source = 'phone'
UNION
SELECT name, source FROM stuff WHERE source != 'phone';
```

| name    | source |
| ------- | ------ |
| Charlie | phone  |
| Frank   | email  |
| Ivy     | email  |
| Alice   | phone  |
| Grace   | web    |
| Hank    | phone  |
| Eve     | web    |

Když si ale necháme vypsat vše:

```sql
SELECT name, source FROM stuff;
```

| name    | source |
| ------- | ------ |
| Alice   | phone  |
| Bob     |        |
| Charlie | phone  |
| David   |        |
| Eve     | web    |
| Frank   | email  |
| Grace   | web    |
| Hank    | phone  |
| Ivy     | email  |
| Jack    |        |

To jsou jiné výsledky! A už na první pohled asi vidíme rozdíl. Zase nám tu dělají problém "The NULL Boys" = Bob, David a Jack.

Proč? Vždyť výraz a jeho negace mají pokrýt celou množinu. Tak proč tomu tak není? Protože `NULL` nehraje podle pravidel. Databáze porovnává hodnotu `phone` se všemi řádky. U Boba vznikne porovnání (`NULL = 'phone'`). Jak jsme si ale ukázali, jakékoliv porovnání s `NULL` vrátí `NULL`. A `NULL` **není** `False`. `NULL` je `UNKNOWN`. Takové řádky jdou automaticky pryč. Nesplnily podmínku a tedy nemají být ve výsledku. To platí jak pro "kladné" porovnání (`source = 'phone'`), tak i pro "negativní" porovnání (`source != 'phone'`). U obou variant není řádek s `NULL` vyhozen, protože by porovnání vrátilo `True` nebo `False`, ale protože vyšlo `NULL`. U "kladného" porovnání je to tak spíše šťastný dopad vlastnosti porovnání s `NULL`. Bohužel "negativní" porovnání už takově štěstí nemělo.

Dobrá. Co dělat, když chceme správný výsledek pro zadání:

```text
Vyber všechny osoby, které NEjsou z telefonické kampaně.
```

```sql
SELECT name, source FROM stuff WHERE source != 'phone' OR source IS NULL;
```

| name  | source |
| ----- | ------ |
| Bob   |        |
| David |        |
| Eve   | web    |
| Frank | email  |
| Grace | web    |
| Ivy   | email  |
| Jack  |        |

Toto je možné řešení, ale opravdu mám všude psát `IS (NOT) NULL`, když je ve sloupci možné `NULL`? Ne nutně. Samozřejmě že SQL obsahuje syntax, která nám mohla ušetřit problémy:

```sql
SELECT name, source FROM stuff WHERE source IS DISTINCT FROM 'phone';
```

| name  | source |
| ----- | ------ |
| Bob   |        |
| David |        |
| Eve   | web    |
| Frank | email  |
| Grace | web    |
| Ivy   | email  |
| Jack  |        |

Aneb když si nejsme jisti, můžeme použít `IS DISTINCT FROM`. To za nás vyřeší problémy s `NULL` a chová se trochu více intuitivně, než klasické porovnání na nerovnost.

Podobně si pak musíme dát pozor například u agregačních funkcí (`MIN`, `MAX`, `SUM`), jelikož i ty "ignorují" `NULL`, pokud je parametrem "NULLable" sloupec.

Jaké má být ponaučení?

Na `NULL` si musíme dávat pozor nejen když jej porovnáváme "přímo" (`source = NULL` vs `source IS NULL`), ale také když jej porovnáváme "nepřímo" (`source != 'phone'` vs. `source IS DISTINCT FROM 'phone'`). Pokaždé, když pracujeme s nullable sloupcem a jeho daty bychom měli pracovat s jeho řádky jak s `NULL` samotným.

A protože používáme různá ORM. Dejme si pozor, co dělají s takovými dotazy. Překládají je "správně", nebo "naivně"? Čteme náležitě dokumentaci? Používáme je správně?
