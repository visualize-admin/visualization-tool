Temporal [[dimension]] that has [[dimension value]] of [[temporal entity]] type.
### how to detect?

This way might be a bit fragile, but it's the way the things are set up currently in AMDP cubes that are the only example we have.
- GeneralDateTimeDescription `dataKind`
- ordinal `scaleType`
- non-empty [[time unit]]

### current constraints
Currently, we only allow monthly and yearly [[time unit]]s, as for these, [[temporal entity]] contains formatted date in [[schema > position]].
Once [this conversation](https://zulip.zazuko.com/#narrow/stream/40-bafu-ext/topic/temporal.20entity.20and.20schema.3AsameAs) is resolved, we will need to switch to other property (e.g. [[schema > sameAs]]).