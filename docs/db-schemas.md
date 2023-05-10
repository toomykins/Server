# Database Schemas

## Account

```sql
id - bigint
email - varchar
username - varchar[20]
password - char[60]
staff_modlevel - int
```

## Recovery Questions

```sql
account_id - bigint
recovery_id - int
recovery_question - varchar
recovery_answer - varchar
```

## Login History

```sql
account_id - bigint
login_time - datetime
login_ip - varchar[36]
login_world - int
```

## Friend List

```sql
account_id - bigint
friend_name - bigint
```

## Ignore List

```sql
account_id - bigint
ignore_name - bigint
```

## Game Log Event

Generic table for scripts to log events to

```sql
account_id - bigint
event_time - datetime
event_message - varchar
```

## Game Log Session

TODO

## Game Log Trade

TODO
