#### why we need to load all values upfront, when initializing chart from cube?
It's needed in order to be able to correctly select initial filter value – so e.g. it's Zurich that's selected, instead of Aargau.

**Context**
During performance improvements work, an idea emerged to not load dimension values when initializing chart from cube. As we need to fetch them to correctly initialize filters, a trial was done to only fetch one value; but then the results were not right, as without sorting, the order was messed up.