# do-toggle
toggle a host or peer element prop

```html
<my-component itemscope>
    <div 🔭 itemprop=likes></div>
    <button do-inc="likes byAmt `1` on click">Like</button>
    <button do-inc="likes byAmt `-1`">Dislike</button>
    <button do-set="likes to `0` as number">Reset</button> <!-- prevent setting property ending with HTML -->
    <button do-toggle="isHappy">Toggle Mood</button>
    <xtal-element 
        prop-defaults='{
            "likes": 0,
            "isHappy": true,
        }'

    ></xtal-element>
</my-component>
```
