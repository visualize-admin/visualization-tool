import { describe, expect, it } from "vitest";

import { getCombinedTemporalDimension } from "@/charts/shared/use-combined-temporal-dimension";
import { Dimension } from "@/domain/data";
import { stringifyComponentId } from "@/graphql/make-component-id";
import { getD3TimeFormatLocale } from "@/locales/locales";

describe("useCombinedTemporalDimension", () => {
  it("should return combined temporal dimension", () => {
    const dimensions = [
      {
        __typename: "NominalDimension",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/unit",
        label: "Unit",
        description: "Unit of measure that defines the product.",
        scaleType: "Nominal",
        order: 1,
        isNumerical: false,
        isKeyDimension: false,
        values: [
          {
            value: "https://agriculture.ld.admin.ch/foag/unit/1",
            label: "kg",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/unit/7",
            label: "Litres",
          },
        ],
        relatedLimitValues: [],
        related: [],
        hierarchy: null,
      },
      {
        __typename: "NominalDimension",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/currency",
        label: "Currency",
        description:
          "Official means of payment with which a product is bought or sold. Currency is only relevant for the key indicator price.",
        scaleType: "Nominal",
        order: 2,
        isNumerical: false,
        isKeyDimension: false,
        values: [
          {
            value: "https://agriculture.ld.admin.ch/foag/currency/CHF",
            label: "Francs",
          },
        ],
        related: [],
        hierarchy: null,
      },
      {
        __typename: "NominalDimension",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/key-indicator-type",
        label: "Key indicator",
        description: "Statement of the key figure used for this data set.",
        scaleType: "Nominal",
        order: 3,
        isNumerical: false,
        isKeyDimension: true,
        values: [
          {
            value: "https://agriculture.ld.admin.ch/foag/key-indicator-type/1",
            label: "Price",
          },
        ],
        related: [],
        hierarchy: null,
      },
      {
        __typename: "TemporalEntityDimension",
        timeFormat: "%Y-%m",
        timeUnit: "Month",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/date",
        label: "Date",
        description: "Statement of the date for the present data point",
        scaleType: "Ordinal",
        order: 4,
        isNumerical: false,
        isKeyDimension: true,
        values: [
          {
            value: "https://ld.admin.ch/time/month/2000-01",
            label: "January 2000",
            position: "2000-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2000-02",
            label: "February 2000",
            position: "2000-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2000-03",
            label: "March 2000",
            position: "2000-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2000-04",
            label: "April 2000",
            position: "2000-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2000-05",
            label: "May 2000",
            position: "2000-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2000-06",
            label: "June 2000",
            position: "2000-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2000-07",
            label: "July 2000",
            position: "2000-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2000-08",
            label: "August 2000",
            position: "2000-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2000-09",
            label: "September 2000",
            position: "2000-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2000-10",
            label: "October 2000",
            position: "2000-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2000-11",
            label: "November 2000",
            position: "2000-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2000-12",
            label: "December 2000",
            position: "2000-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2001-01",
            label: "January 2001",
            position: "2001-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2001-02",
            label: "February 2001",
            position: "2001-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2001-03",
            label: "March 2001",
            position: "2001-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2001-04",
            label: "April 2001",
            position: "2001-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2001-05",
            label: "May 2001",
            position: "2001-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2001-06",
            label: "June 2001",
            position: "2001-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2001-07",
            label: "July 2001",
            position: "2001-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2001-08",
            label: "August 2001",
            position: "2001-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2001-09",
            label: "September 2001",
            position: "2001-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2001-10",
            label: "October 2001",
            position: "2001-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2001-11",
            label: "November 2001",
            position: "2001-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2001-12",
            label: "December 2001",
            position: "2001-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2002-01",
            label: "January 2002",
            position: "2002-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2002-02",
            label: "February 2002",
            position: "2002-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2002-03",
            label: "March 2002",
            position: "2002-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2002-04",
            label: "April 2002",
            position: "2002-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2002-05",
            label: "May 2002",
            position: "2002-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2002-06",
            label: "June 2002",
            position: "2002-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2002-07",
            label: "July 2002",
            position: "2002-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2002-08",
            label: "August 2002",
            position: "2002-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2002-09",
            label: "September 2002",
            position: "2002-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2002-10",
            label: "October 2002",
            position: "2002-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2002-11",
            label: "November 2002",
            position: "2002-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2002-12",
            label: "December 2002",
            position: "2002-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2003-01",
            label: "January 2003",
            position: "2003-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2003-02",
            label: "February 2003",
            position: "2003-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2003-03",
            label: "March 2003",
            position: "2003-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2003-04",
            label: "April 2003",
            position: "2003-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2003-05",
            label: "May 2003",
            position: "2003-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2003-06",
            label: "June 2003",
            position: "2003-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2003-07",
            label: "July 2003",
            position: "2003-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2003-08",
            label: "August 2003",
            position: "2003-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2003-09",
            label: "September 2003",
            position: "2003-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2003-10",
            label: "October 2003",
            position: "2003-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2003-11",
            label: "November 2003",
            position: "2003-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2003-12",
            label: "December 2003",
            position: "2003-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2004-01",
            label: "January 2004",
            position: "2004-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2004-02",
            label: "February 2004",
            position: "2004-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2004-03",
            label: "March 2004",
            position: "2004-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2004-04",
            label: "April 2004",
            position: "2004-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2004-05",
            label: "May 2004",
            position: "2004-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2004-06",
            label: "June 2004",
            position: "2004-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2004-07",
            label: "July 2004",
            position: "2004-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2004-08",
            label: "August 2004",
            position: "2004-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2004-09",
            label: "September 2004",
            position: "2004-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2004-10",
            label: "October 2004",
            position: "2004-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2004-11",
            label: "November 2004",
            position: "2004-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2004-12",
            label: "December 2004",
            position: "2004-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2005-01",
            label: "January 2005",
            position: "2005-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2005-02",
            label: "February 2005",
            position: "2005-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2005-03",
            label: "March 2005",
            position: "2005-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2005-04",
            label: "April 2005",
            position: "2005-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2005-05",
            label: "May 2005",
            position: "2005-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2005-06",
            label: "June 2005",
            position: "2005-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2005-07",
            label: "July 2005",
            position: "2005-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2005-08",
            label: "August 2005",
            position: "2005-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2005-09",
            label: "September 2005",
            position: "2005-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2005-10",
            label: "October 2005",
            position: "2005-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2005-11",
            label: "November 2005",
            position: "2005-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2005-12",
            label: "December 2005",
            position: "2005-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2006-01",
            label: "January 2006",
            position: "2006-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2006-02",
            label: "February 2006",
            position: "2006-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2006-03",
            label: "March 2006",
            position: "2006-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2006-04",
            label: "April 2006",
            position: "2006-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2006-05",
            label: "May 2006",
            position: "2006-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2006-06",
            label: "June 2006",
            position: "2006-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2006-07",
            label: "July 2006",
            position: "2006-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2006-08",
            label: "August 2006",
            position: "2006-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2006-09",
            label: "September 2006",
            position: "2006-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2006-10",
            label: "October 2006",
            position: "2006-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2006-11",
            label: "November 2006",
            position: "2006-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2006-12",
            label: "December 2006",
            position: "2006-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2007-01",
            label: "January 2007",
            position: "2007-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2007-02",
            label: "February 2007",
            position: "2007-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2007-03",
            label: "March 2007",
            position: "2007-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2007-04",
            label: "April 2007",
            position: "2007-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2007-05",
            label: "May 2007",
            position: "2007-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2007-06",
            label: "June 2007",
            position: "2007-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2007-07",
            label: "July 2007",
            position: "2007-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2007-08",
            label: "August 2007",
            position: "2007-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2007-09",
            label: "September 2007",
            position: "2007-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2007-10",
            label: "October 2007",
            position: "2007-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2007-11",
            label: "November 2007",
            position: "2007-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2007-12",
            label: "December 2007",
            position: "2007-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2008-01",
            label: "January 2008",
            position: "2008-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2008-02",
            label: "February 2008",
            position: "2008-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2008-03",
            label: "March 2008",
            position: "2008-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2008-04",
            label: "April 2008",
            position: "2008-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2008-05",
            label: "May 2008",
            position: "2008-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2008-06",
            label: "June 2008",
            position: "2008-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2008-07",
            label: "July 2008",
            position: "2008-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2008-08",
            label: "August 2008",
            position: "2008-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2008-09",
            label: "September 2008",
            position: "2008-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2008-10",
            label: "October 2008",
            position: "2008-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2008-11",
            label: "November 2008",
            position: "2008-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2008-12",
            label: "December 2008",
            position: "2008-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2009-01",
            label: "January 2009",
            position: "2009-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2009-02",
            label: "February 2009",
            position: "2009-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2009-03",
            label: "March 2009",
            position: "2009-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2009-04",
            label: "April 2009",
            position: "2009-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2009-05",
            label: "May 2009",
            position: "2009-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2009-06",
            label: "June 2009",
            position: "2009-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2009-07",
            label: "July 2009",
            position: "2009-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2009-08",
            label: "August 2009",
            position: "2009-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2009-09",
            label: "September 2009",
            position: "2009-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2009-10",
            label: "October 2009",
            position: "2009-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2009-11",
            label: "November 2009",
            position: "2009-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2009-12",
            label: "December 2009",
            position: "2009-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2010-01",
            label: "January 2010",
            position: "2010-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2010-02",
            label: "February 2010",
            position: "2010-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2010-03",
            label: "March 2010",
            position: "2010-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2010-04",
            label: "April 2010",
            position: "2010-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2010-05",
            label: "May 2010",
            position: "2010-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2010-06",
            label: "June 2010",
            position: "2010-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2010-07",
            label: "July 2010",
            position: "2010-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2010-08",
            label: "August 2010",
            position: "2010-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2010-09",
            label: "September 2010",
            position: "2010-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2010-10",
            label: "October 2010",
            position: "2010-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2010-11",
            label: "November 2010",
            position: "2010-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2010-12",
            label: "December 2010",
            position: "2010-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2011-01",
            label: "January 2011",
            position: "2011-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2011-02",
            label: "February 2011",
            position: "2011-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2011-03",
            label: "March 2011",
            position: "2011-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2011-04",
            label: "April 2011",
            position: "2011-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2011-05",
            label: "May 2011",
            position: "2011-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2011-06",
            label: "June 2011",
            position: "2011-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2011-07",
            label: "July 2011",
            position: "2011-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2011-08",
            label: "August 2011",
            position: "2011-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2011-09",
            label: "September 2011",
            position: "2011-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2011-10",
            label: "October 2011",
            position: "2011-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2011-11",
            label: "November 2011",
            position: "2011-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2011-12",
            label: "December 2011",
            position: "2011-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2012-01",
            label: "January 2012",
            position: "2012-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2012-02",
            label: "February 2012",
            position: "2012-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2012-03",
            label: "March 2012",
            position: "2012-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2012-04",
            label: "April 2012",
            position: "2012-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2012-05",
            label: "May 2012",
            position: "2012-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2012-06",
            label: "June 2012",
            position: "2012-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2012-07",
            label: "July 2012",
            position: "2012-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2012-08",
            label: "August 2012",
            position: "2012-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2012-09",
            label: "September 2012",
            position: "2012-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2012-10",
            label: "October 2012",
            position: "2012-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2012-11",
            label: "November 2012",
            position: "2012-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2012-12",
            label: "December 2012",
            position: "2012-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2013-01",
            label: "January 2013",
            position: "2013-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2013-02",
            label: "February 2013",
            position: "2013-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2013-03",
            label: "March 2013",
            position: "2013-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2013-04",
            label: "April 2013",
            position: "2013-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2013-05",
            label: "May 2013",
            position: "2013-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2013-06",
            label: "June 2013",
            position: "2013-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2013-07",
            label: "July 2013",
            position: "2013-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2013-08",
            label: "August 2013",
            position: "2013-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2013-09",
            label: "September 2013",
            position: "2013-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2013-10",
            label: "October 2013",
            position: "2013-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2013-11",
            label: "November 2013",
            position: "2013-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2013-12",
            label: "December 2013",
            position: "2013-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2014-01",
            label: "January 2014",
            position: "2014-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2014-02",
            label: "February 2014",
            position: "2014-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2014-03",
            label: "March 2014",
            position: "2014-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2014-04",
            label: "April 2014",
            position: "2014-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2014-05",
            label: "May 2014",
            position: "2014-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2014-06",
            label: "June 2014",
            position: "2014-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2014-07",
            label: "July 2014",
            position: "2014-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2014-08",
            label: "August 2014",
            position: "2014-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2014-09",
            label: "September 2014",
            position: "2014-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2014-10",
            label: "October 2014",
            position: "2014-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2014-11",
            label: "November 2014",
            position: "2014-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2014-12",
            label: "December 2014",
            position: "2014-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2015-01",
            label: "January 2015",
            position: "2015-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2015-02",
            label: "February 2015",
            position: "2015-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2015-03",
            label: "March 2015",
            position: "2015-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2015-04",
            label: "April 2015",
            position: "2015-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2015-05",
            label: "May 2015",
            position: "2015-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2015-06",
            label: "June 2015",
            position: "2015-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2015-07",
            label: "July 2015",
            position: "2015-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2015-08",
            label: "August 2015",
            position: "2015-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2015-09",
            label: "September 2015",
            position: "2015-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2015-10",
            label: "October 2015",
            position: "2015-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2015-11",
            label: "November 2015",
            position: "2015-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2015-12",
            label: "December 2015",
            position: "2015-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2016-01",
            label: "January 2016",
            position: "2016-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2016-02",
            label: "February 2016",
            position: "2016-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2016-03",
            label: "March 2016",
            position: "2016-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2016-04",
            label: "April 2016",
            position: "2016-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2016-05",
            label: "May 2016",
            position: "2016-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2016-06",
            label: "June 2016",
            position: "2016-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2016-07",
            label: "July 2016",
            position: "2016-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2016-08",
            label: "August 2016",
            position: "2016-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2016-09",
            label: "September 2016",
            position: "2016-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2016-10",
            label: "October 2016",
            position: "2016-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2016-11",
            label: "November 2016",
            position: "2016-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2016-12",
            label: "December 2016",
            position: "2016-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2017-01",
            label: "January 2017",
            position: "2017-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2017-02",
            label: "February 2017",
            position: "2017-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2017-03",
            label: "March 2017",
            position: "2017-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2017-04",
            label: "April 2017",
            position: "2017-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2017-05",
            label: "May 2017",
            position: "2017-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2017-06",
            label: "June 2017",
            position: "2017-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2017-07",
            label: "July 2017",
            position: "2017-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2017-08",
            label: "August 2017",
            position: "2017-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2017-09",
            label: "September 2017",
            position: "2017-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2017-10",
            label: "October 2017",
            position: "2017-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2017-11",
            label: "November 2017",
            position: "2017-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2017-12",
            label: "December 2017",
            position: "2017-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2018-01",
            label: "January 2018",
            position: "2018-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2018-02",
            label: "February 2018",
            position: "2018-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2018-03",
            label: "March 2018",
            position: "2018-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2018-04",
            label: "April 2018",
            position: "2018-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2018-05",
            label: "May 2018",
            position: "2018-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2018-06",
            label: "June 2018",
            position: "2018-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2018-07",
            label: "July 2018",
            position: "2018-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2018-08",
            label: "August 2018",
            position: "2018-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2018-09",
            label: "September 2018",
            position: "2018-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2018-10",
            label: "October 2018",
            position: "2018-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2018-11",
            label: "November 2018",
            position: "2018-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2018-12",
            label: "December 2018",
            position: "2018-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2019-01",
            label: "January 2019",
            position: "2019-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2019-02",
            label: "February 2019",
            position: "2019-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2019-03",
            label: "March 2019",
            position: "2019-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2019-04",
            label: "April 2019",
            position: "2019-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2019-05",
            label: "May 2019",
            position: "2019-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2019-06",
            label: "June 2019",
            position: "2019-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2019-07",
            label: "July 2019",
            position: "2019-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2019-08",
            label: "August 2019",
            position: "2019-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2019-09",
            label: "September 2019",
            position: "2019-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2019-10",
            label: "October 2019",
            position: "2019-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2019-11",
            label: "November 2019",
            position: "2019-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2019-12",
            label: "December 2019",
            position: "2019-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2020-01",
            label: "January 2020",
            position: "2020-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2020-02",
            label: "February 2020",
            position: "2020-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2020-03",
            label: "March 2020",
            position: "2020-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2020-04",
            label: "April 2020",
            position: "2020-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2020-05",
            label: "May 2020",
            position: "2020-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2020-06",
            label: "June 2020",
            position: "2020-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2020-07",
            label: "July 2020",
            position: "2020-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2020-08",
            label: "August 2020",
            position: "2020-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2020-09",
            label: "September 2020",
            position: "2020-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2020-10",
            label: "October 2020",
            position: "2020-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2020-11",
            label: "November 2020",
            position: "2020-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2020-12",
            label: "December 2020",
            position: "2020-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2021-01",
            label: "January 2021",
            position: "2021-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2021-02",
            label: "February 2021",
            position: "2021-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2021-03",
            label: "March 2021",
            position: "2021-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2021-04",
            label: "April 2021",
            position: "2021-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2021-05",
            label: "May 2021",
            position: "2021-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2021-06",
            label: "June 2021",
            position: "2021-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2021-07",
            label: "July 2021",
            position: "2021-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2021-08",
            label: "August 2021",
            position: "2021-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2021-09",
            label: "September 2021",
            position: "2021-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2021-10",
            label: "October 2021",
            position: "2021-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2021-11",
            label: "November 2021",
            position: "2021-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2021-12",
            label: "December 2021",
            position: "2021-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2022-01",
            label: "January 2022",
            position: "2022-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2022-02",
            label: "February 2022",
            position: "2022-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2022-03",
            label: "March 2022",
            position: "2022-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2022-04",
            label: "April 2022",
            position: "2022-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2022-05",
            label: "May 2022",
            position: "2022-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2022-06",
            label: "June 2022",
            position: "2022-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2022-07",
            label: "July 2022",
            position: "2022-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2022-08",
            label: "August 2022",
            position: "2022-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2022-09",
            label: "September 2022",
            position: "2022-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2022-10",
            label: "October 2022",
            position: "2022-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2022-11",
            label: "November 2022",
            position: "2022-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2022-12",
            label: "December 2022",
            position: "2022-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2023-01",
            label: "January 2023",
            position: "2023-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2023-02",
            label: "February 2023",
            position: "2023-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2023-03",
            label: "March 2023",
            position: "2023-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2023-04",
            label: "April 2023",
            position: "2023-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2023-05",
            label: "May 2023",
            position: "2023-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2023-06",
            label: "June 2023",
            position: "2023-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2023-07",
            label: "July 2023",
            position: "2023-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2023-08",
            label: "August 2023",
            position: "2023-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2023-09",
            label: "September 2023",
            position: "2023-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2023-10",
            label: "October 2023",
            position: "2023-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2023-11",
            label: "November 2023",
            position: "2023-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2023-12",
            label: "December 2023",
            position: "2023-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2024-01",
            label: "January 2024",
            position: "2024-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2024-02",
            label: "February 2024",
            position: "2024-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2024-03",
            label: "March 2024",
            position: "2024-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2024-04",
            label: "April 2024",
            position: "2024-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2024-05",
            label: "May 2024",
            position: "2024-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2024-06",
            label: "June 2024",
            position: "2024-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2024-07",
            label: "July 2024",
            position: "2024-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2024-08",
            label: "August 2024",
            position: "2024-08",
          },
        ],
        related: [],
        hierarchy: null,
      },
      {
        __typename: "NominalDimension",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/product",
        label: "Product",
        description:
          "Products or goods that are the subject of market monitoring.",
        scaleType: "Nominal",
        order: 6,
        isNumerical: false,
        isKeyDimension: true,
        values: [
          {
            value: "https://agriculture.ld.admin.ch/foag/product/239",
            label: "Vollmilch UHT",
            identifier: "P_M1",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/240",
            label: "Milch Drink UHT",
            identifier: "P_M12",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/241",
            label: "Kochbutter (Die Butter)",
            identifier: "P_M13",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/254",
            label: "Vollrahm UHT 35%",
            identifier: "P_M27",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/255",
            label: "Halbrahm UHT 25%",
            identifier: "P_M28",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/256",
            label: "Kaffeerahm UHT 15%",
            identifier: "P_M29",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/257",
            label: "Appenzeller mild",
            identifier: "P_M3",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/258",
            label: "Fruchtjoghurt",
            identifier: "P_M30",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/263",
            label: "Vollmilch Past",
            identifier: "P_M39",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/264",
            label: "Raclettekäse",
            identifier: "P_M4",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/265",
            label: "Emmentaler",
            identifier: "P_M41",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/266",
            label: "Milch Drink Past",
            identifier: "P_M43",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/267",
            label: "Joghurt nature",
            identifier: "P_M44",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/268",
            label: "Gruyère",
            identifier: "P_M45",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/272",
            label: "Tomme",
            identifier: "P_M5",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/282",
            label: "Mozzarella",
            identifier: "P_M6",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/287",
            label: "Emmentaler mild",
            identifier: "P_M69",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/288",
            label: "Hüttenkäse nature 15%",
            identifier: "P_M7",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/289",
            label: "Emmentaler surchoix",
            identifier: "P_M70",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/290",
            label: "Gruyère mild",
            identifier: "P_M71",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/291",
            label: "Gruyère surchoix",
            identifier: "P_M72",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/292",
            label: "Appenzeller surchoix",
            identifier: "P_M73",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/293",
            label: "Magermilch UHT",
            identifier: "P_M74",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/294",
            label: "Bratbutter",
            identifier: "P_M75",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/295",
            label: "Sbrinz",
            identifier: "P_M76",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/296",
            label: "Tilsiter mild",
            identifier: "P_M77",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/297",
            label: "Tilsiter surchoix",
            identifier: "P_M78",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/298",
            label: "Tête de Moine",
            identifier: "P_M79",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/299",
            label: "Vorzugsbutter",
            identifier: "P_M8",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/300",
            label: "Vacherin fribourgeois",
            identifier: "P_M80",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/301",
            label: "Edamer CH",
            identifier: "P_M81",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/302",
            label: "Camembert 60%",
            identifier: "P_M82",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/303",
            label: "Weichkäse Croûte-mixte",
            identifier: "P_M83",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/304",
            label: "Brie CH 45%",
            identifier: "P_M84",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/305",
            label: "Tilsiter",
            identifier: "P_M85",
          },
        ],
        related: [],
        hierarchy: [
          {
            label: "Appenzeller mild",
            value: "https://agriculture.ld.admin.ch/foag/product/257",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Appenzeller surchoix",
            value: "https://agriculture.ld.admin.ch/foag/product/292",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Bratbutter",
            value: "https://agriculture.ld.admin.ch/foag/product/294",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Brie CH 45%",
            value: "https://agriculture.ld.admin.ch/foag/product/304",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Camembert 60%",
            value: "https://agriculture.ld.admin.ch/foag/product/302",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Edamer CH",
            value: "https://agriculture.ld.admin.ch/foag/product/301",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Emmentaler",
            value: "https://agriculture.ld.admin.ch/foag/product/265",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Emmentaler mild",
            value: "https://agriculture.ld.admin.ch/foag/product/287",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Emmentaler surchoix",
            value: "https://agriculture.ld.admin.ch/foag/product/289",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Fruchtjoghurt",
            value: "https://agriculture.ld.admin.ch/foag/product/258",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Gruyère",
            value: "https://agriculture.ld.admin.ch/foag/product/268",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Gruyère mild",
            value: "https://agriculture.ld.admin.ch/foag/product/290",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Gruyère surchoix",
            value: "https://agriculture.ld.admin.ch/foag/product/291",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Halbrahm UHT 25%",
            value: "https://agriculture.ld.admin.ch/foag/product/255",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Hüttenkäse nature 15%",
            value: "https://agriculture.ld.admin.ch/foag/product/288",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Joghurt nature",
            value: "https://agriculture.ld.admin.ch/foag/product/267",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Kaffeerahm UHT 15%",
            value: "https://agriculture.ld.admin.ch/foag/product/256",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Kochbutter (Die Butter)",
            value: "https://agriculture.ld.admin.ch/foag/product/241",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Magermilch UHT",
            value: "https://agriculture.ld.admin.ch/foag/product/293",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Milch Drink Past",
            value: "https://agriculture.ld.admin.ch/foag/product/266",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Milch Drink UHT",
            value: "https://agriculture.ld.admin.ch/foag/product/240",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Mozzarella",
            value: "https://agriculture.ld.admin.ch/foag/product/282",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Raclettekäse",
            value: "https://agriculture.ld.admin.ch/foag/product/264",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Sbrinz",
            value: "https://agriculture.ld.admin.ch/foag/product/295",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Tilsiter",
            value: "https://agriculture.ld.admin.ch/foag/product/305",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Tilsiter mild",
            value: "https://agriculture.ld.admin.ch/foag/product/296",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Tilsiter surchoix",
            value: "https://agriculture.ld.admin.ch/foag/product/297",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Tomme",
            value: "https://agriculture.ld.admin.ch/foag/product/272",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Tête de Moine",
            value: "https://agriculture.ld.admin.ch/foag/product/298",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Vacherin fribourgeois",
            value: "https://agriculture.ld.admin.ch/foag/product/300",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Vollmilch Past",
            value: "https://agriculture.ld.admin.ch/foag/product/263",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Vollmilch UHT",
            value: "https://agriculture.ld.admin.ch/foag/product/239",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Vollrahm UHT 35%",
            value: "https://agriculture.ld.admin.ch/foag/product/254",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Vorzugsbutter",
            value: "https://agriculture.ld.admin.ch/foag/product/299",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Weichkäse Croûte-mixte",
            value: "https://agriculture.ld.admin.ch/foag/product/303",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
        ],
      },
      {
        __typename: "NominalDimension",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
        label: "Product subgroup",
        description:
          "Products or goods grouped together in subgroups that are the subject of market observation.",
        scaleType: "Nominal",
        order: 7,
        isNumerical: false,
        isKeyDimension: false,
        values: [
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/1",
            label: "Appenzeller",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/16",
            label: "Emmentaler",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/18",
            label: "Gruyère",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/19",
            label: "Halbrahm",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/20",
            label: "Hüttenkäse",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/23",
            label: "Joghurt andere Früchte",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/24",
            label: "Joghurt nature",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/25",
            label: "Kaffeerahm",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/29",
            label: "Kochbutter",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/3",
            label: "Bratbutter",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/39",
            label: "Magermilch",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/4",
            label: "Brie CH 45%",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/41",
            label: "Milch Drink",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/42",
            label: "Mozzarella",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/43",
            label: "Raclettekäse",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/47",
            label: "Sbrinz",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/63",
            label: "Tête de Moine",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/64",
            label: "Tilsiter",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/65",
            label: "Tomme",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/66",
            label: "Vacherin fribourgeois",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/71",
            label: "Vollmilch",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/73",
            label: "Vollrahm",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/74",
            label: "Vorzugsbutter",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/75",
            label: "Weichkäse Croûte-mixte",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/8",
            label: "Camembert 60%",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/9",
            label: "Edamer CH",
          },
        ],
        related: [],
        hierarchy: [
          {
            label: "Appenzeller",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/1",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Bratbutter",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/3",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Brie CH 45%",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/4",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Camembert 60%",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/8",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Edamer CH",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/9",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Emmentaler",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/16",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Gruyère",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/18",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Halbrahm",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/19",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Hüttenkäse",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/20",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Joghurt andere Früchte",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/23",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Joghurt nature",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/24",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Kaffeerahm",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/25",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Kochbutter",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/29",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Magermilch",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/39",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Milch Drink",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/41",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Mozzarella",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/42",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Raclettekäse",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/43",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Sbrinz",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/47",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Tilsiter",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/64",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Tomme",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/65",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Tête de Moine",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/63",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Vacherin fribourgeois",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/66",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Vollmilch",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/71",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Vollrahm",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/73",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Vorzugsbutter",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/74",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Weichkäse Croûte-mixte",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/75",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
        ],
      },
      {
        __typename: "NominalDimension",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/product-group",
        label: "Product group",
        description:
          "Products or goods grouped together that are the subject of market monitoring.",
        scaleType: "Nominal",
        order: 8,
        isNumerical: false,
        isKeyDimension: false,
        values: [
          {
            value: "https://agriculture.ld.admin.ch/foag/product-group/10",
            label: "Rahm",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-group/2",
            label: "Butter",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-group/4",
            label: "Joghurt",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-group/6",
            label: "Käse",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-group/7",
            label: "Konsummilch",
          },
        ],
        related: [],
        hierarchy: [
          {
            label: "Butter",
            value: "https://agriculture.ld.admin.ch/foag/product-group/2",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-group",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Joghurt",
            value: "https://agriculture.ld.admin.ch/foag/product-group/4",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-group",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Konsummilch",
            value: "https://agriculture.ld.admin.ch/foag/product-group/7",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-group",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Käse",
            value: "https://agriculture.ld.admin.ch/foag/product-group/6",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-group",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Rahm",
            value: "https://agriculture.ld.admin.ch/foag/product-group/10",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-group",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
        ],
      },
      {
        __typename: "NominalDimension",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/market",
        label: "Market",
        description: "Agricultural or food market of the product.",
        scaleType: "Nominal",
        order: 9,
        isNumerical: false,
        isKeyDimension: false,
        values: [
          {
            value: "https://agriculture.ld.admin.ch/foag/market/3",
            label: "Milch und Milchprodukte",
          },
        ],
        related: [],
        hierarchy: null,
      },
      {
        __typename: "NominalDimension",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/production-system",
        label: "Production system",
        description:
          "Method of cultivation or husbandry according to which a product is produced.",
        scaleType: "Nominal",
        order: 10,
        isNumerical: false,
        isKeyDimension: true,
        values: [
          {
            value: "https://agriculture.ld.admin.ch/foag/production-system/1",
            label: "Organic",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/production-system/3",
            label: "Conventional",
          },
        ],
        related: [],
        hierarchy: null,
      },
      {
        __typename: "NominalDimension",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/value-chain",
        label: "Value chain",
        description:
          "Simplified statement on the processing and trade stage of a product.",
        scaleType: "Nominal",
        order: 11,
        isNumerical: false,
        isKeyDimension: false,
        values: [
          {
            value: "https://agriculture.ld.admin.ch/foag/value-chain/6",
            label: "Consumption",
          },
        ],
        related: [],
        hierarchy: null,
      },
      {
        __typename: "NominalDimension",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/value-chain-detail",
        label: "Value chain detail",
        description:
          "Detailed information on the processing and trade stage of a product.",
        scaleType: "Nominal",
        order: 12,
        isNumerical: false,
        isKeyDimension: true,
        values: [
          {
            value: "https://agriculture.ld.admin.ch/foag/value-chain-detail/18",
            label: "Ex-retail",
          },
        ],
        related: [],
        hierarchy: [
          {
            label: "Consumption",
            value: "https://agriculture.ld.admin.ch/foag/value-chain/6",
            children: [
              {
                label: "Ex-retail",
                value:
                  "https://agriculture.ld.admin.ch/foag/value-chain-detail/18",
                children: [],
                depth: 1,
                dimensionId:
                  "https://agriculture.ld.admin.ch/foag/dimension/value-chain-detail",
                hasValue: true,
              },
            ],
            depth: 0,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/value-chain-detail",
            hasValue: false,
            hierarchyName: "Value Chain - Detail",
          },
        ],
      },
      {
        __typename: "NominalDimension",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/data-source",
        label: "Data source",
        description: "Source to be indicated when using the data.",
        scaleType: "Nominal",
        order: 13,
        isNumerical: false,
        isKeyDimension: false,
        values: [
          {
            value: "https://agriculture.ld.admin.ch/foag/data-source/1",
            label: "FOAG, Market Analysis",
          },
        ],
        related: [],
        hierarchy: null,
      },
      {
        __typename: "NominalDimension",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/data-method",
        label: "Data method",
        description: "Method used to compile / create the data.",
        scaleType: "Nominal",
        order: 14,
        isNumerical: false,
        isKeyDimension: false,
        values: [
          {
            value: "https://agriculture.ld.admin.ch/foag/data-method/5",
            label: "Realised value",
          },
        ],
        related: [],
        hierarchy: null,
      },
      {
        __typename: "NominalDimension",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/product-properties",
        label: "Product properties",
        description:
          "Characteristics of the product that describe its quality or condition.",
        scaleType: "Nominal",
        order: 15,
        isNumerical: false,
        isKeyDimension: false,
        values: [
          {
            value: "https://agriculture.ld.admin.ch/foag/product-properties/0",
            label: "NA",
          },
        ],
        related: [],
        hierarchy: null,
      },
      {
        __typename: "NominalDimension",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/product-origin",
        label: "Product origin",
        description: "Geographical area from which the product originates.",
        scaleType: "Nominal",
        order: 16,
        isNumerical: false,
        isKeyDimension: false,
        values: [
          {
            value: "https://agriculture.ld.admin.ch/foag/product-origin/1",
            label: "Switzerland",
          },
        ],
        related: [],
        hierarchy: null,
      },
      {
        __typename: "NominalDimension",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/sales-region",
        label: "Sales region",
        description: "Geographical area in which a product is sold.",
        scaleType: "Nominal",
        order: 17,
        isNumerical: false,
        isKeyDimension: false,
        values: [
          {
            value: "https://agriculture.ld.admin.ch/foag/sales-region/1",
            label: "Switzerland",
          },
        ],
        related: [],
        hierarchy: null,
      },
      {
        __typename: "NominalDimension",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/foreign-trade",
        label: "Foreign trade",
        description:
          "Direction of foreign trade (import/export) and information on import or export quota.",
        scaleType: "Nominal",
        order: 18,
        isNumerical: false,
        isKeyDimension: false,
        values: [
          {
            value: "https://agriculture.ld.admin.ch/foag/foreign-trade/0",
            label: "NA",
          },
        ],
        related: [],
        hierarchy: null,
      },
      {
        __typename: "NominalDimension",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/usage",
        label: "Usage",
        description: "Statement of the use for which the product is intended.",
        scaleType: "Nominal",
        order: 19,
        isNumerical: false,
        isKeyDimension: false,
        values: [
          {
            value: "https://agriculture.ld.admin.ch/foag/usage/0",
            label: "NA",
          },
        ],
        related: [],
        hierarchy: null,
      },
      {
        __typename: "NominalDimension",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/cost-component",
        label: "Cost component",
        description:
          "Indication of whether currency details are with or without VAT.",
        scaleType: "Nominal",
        order: 20,
        isNumerical: false,
        isKeyDimension: false,
        values: [
          {
            value: "https://agriculture.ld.admin.ch/foag/cost-component/1",
            label: "incl. VAT",
          },
        ],
        related: [],
        hierarchy: null,
      },
      {
        __typename: "NominalDimension",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/unit",
        label: "Unit",
        description: "Unit of measure that defines the product.",
        scaleType: "Nominal",
        order: 1,
        isNumerical: false,
        isKeyDimension: false,
        values: [
          {
            value: "https://agriculture.ld.admin.ch/foag/unit/1",
            label: "kg",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/unit/7",
            label: "Litres",
          },
        ],
        related: [],
        hierarchy: null,
      },
      {
        __typename: "NominalDimension",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/currency",
        label: "Currency",
        description:
          "Official means of payment with which a product is bought or sold. Currency is only relevant for the key indicator price.",
        scaleType: "Nominal",
        order: 2,
        isNumerical: false,
        isKeyDimension: false,
        values: [
          {
            value: "https://agriculture.ld.admin.ch/foag/currency/CHF",
            label: "Francs",
          },
        ],
        related: [],
        hierarchy: null,
      },
      {
        __typename: "NominalDimension",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/key-indicator-type",
        label: "Key indicator",
        description: "Statement of the key figure used for this data set.",
        scaleType: "Nominal",
        order: 3,
        isNumerical: false,
        isKeyDimension: true,
        values: [
          {
            value: "https://agriculture.ld.admin.ch/foag/key-indicator-type/1",
            label: "Price",
          },
        ],
        related: [],
        hierarchy: null,
      },
      {
        __typename: "TemporalEntityDimension",
        timeFormat: "%Y-%m",
        timeUnit: "Month",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/date",
        label: "Date",
        description: "Statement of the date for the present data point",
        scaleType: "Ordinal",
        order: 4,
        isNumerical: false,
        isKeyDimension: true,
        values: [
          {
            value: "https://ld.admin.ch/time/month/2000-01",
            label: "January 2000",
            position: "2000-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2000-02",
            label: "February 2000",
            position: "2000-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2000-03",
            label: "March 2000",
            position: "2000-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2000-04",
            label: "April 2000",
            position: "2000-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2000-05",
            label: "May 2000",
            position: "2000-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2000-06",
            label: "June 2000",
            position: "2000-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2000-07",
            label: "July 2000",
            position: "2000-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2000-08",
            label: "August 2000",
            position: "2000-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2000-09",
            label: "September 2000",
            position: "2000-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2000-10",
            label: "October 2000",
            position: "2000-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2000-11",
            label: "November 2000",
            position: "2000-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2000-12",
            label: "December 2000",
            position: "2000-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2001-01",
            label: "January 2001",
            position: "2001-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2001-02",
            label: "February 2001",
            position: "2001-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2001-03",
            label: "March 2001",
            position: "2001-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2001-04",
            label: "April 2001",
            position: "2001-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2001-05",
            label: "May 2001",
            position: "2001-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2001-06",
            label: "June 2001",
            position: "2001-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2001-07",
            label: "July 2001",
            position: "2001-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2001-08",
            label: "August 2001",
            position: "2001-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2001-09",
            label: "September 2001",
            position: "2001-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2001-10",
            label: "October 2001",
            position: "2001-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2001-11",
            label: "November 2001",
            position: "2001-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2001-12",
            label: "December 2001",
            position: "2001-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2002-01",
            label: "January 2002",
            position: "2002-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2002-02",
            label: "February 2002",
            position: "2002-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2002-03",
            label: "March 2002",
            position: "2002-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2002-04",
            label: "April 2002",
            position: "2002-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2002-05",
            label: "May 2002",
            position: "2002-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2002-06",
            label: "June 2002",
            position: "2002-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2002-07",
            label: "July 2002",
            position: "2002-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2002-08",
            label: "August 2002",
            position: "2002-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2002-09",
            label: "September 2002",
            position: "2002-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2002-10",
            label: "October 2002",
            position: "2002-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2002-11",
            label: "November 2002",
            position: "2002-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2002-12",
            label: "December 2002",
            position: "2002-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2003-01",
            label: "January 2003",
            position: "2003-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2003-02",
            label: "February 2003",
            position: "2003-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2003-03",
            label: "March 2003",
            position: "2003-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2003-04",
            label: "April 2003",
            position: "2003-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2003-05",
            label: "May 2003",
            position: "2003-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2003-06",
            label: "June 2003",
            position: "2003-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2003-07",
            label: "July 2003",
            position: "2003-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2003-08",
            label: "August 2003",
            position: "2003-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2003-09",
            label: "September 2003",
            position: "2003-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2003-10",
            label: "October 2003",
            position: "2003-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2003-11",
            label: "November 2003",
            position: "2003-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2003-12",
            label: "December 2003",
            position: "2003-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2004-01",
            label: "January 2004",
            position: "2004-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2004-02",
            label: "February 2004",
            position: "2004-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2004-03",
            label: "March 2004",
            position: "2004-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2004-04",
            label: "April 2004",
            position: "2004-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2004-05",
            label: "May 2004",
            position: "2004-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2004-06",
            label: "June 2004",
            position: "2004-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2004-07",
            label: "July 2004",
            position: "2004-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2004-08",
            label: "August 2004",
            position: "2004-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2004-09",
            label: "September 2004",
            position: "2004-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2004-10",
            label: "October 2004",
            position: "2004-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2004-11",
            label: "November 2004",
            position: "2004-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2004-12",
            label: "December 2004",
            position: "2004-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2005-01",
            label: "January 2005",
            position: "2005-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2005-02",
            label: "February 2005",
            position: "2005-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2005-03",
            label: "March 2005",
            position: "2005-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2005-04",
            label: "April 2005",
            position: "2005-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2005-05",
            label: "May 2005",
            position: "2005-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2005-06",
            label: "June 2005",
            position: "2005-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2005-07",
            label: "July 2005",
            position: "2005-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2005-08",
            label: "August 2005",
            position: "2005-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2005-09",
            label: "September 2005",
            position: "2005-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2005-10",
            label: "October 2005",
            position: "2005-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2005-11",
            label: "November 2005",
            position: "2005-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2005-12",
            label: "December 2005",
            position: "2005-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2006-01",
            label: "January 2006",
            position: "2006-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2006-02",
            label: "February 2006",
            position: "2006-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2006-03",
            label: "March 2006",
            position: "2006-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2006-04",
            label: "April 2006",
            position: "2006-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2006-05",
            label: "May 2006",
            position: "2006-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2006-06",
            label: "June 2006",
            position: "2006-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2006-07",
            label: "July 2006",
            position: "2006-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2006-08",
            label: "August 2006",
            position: "2006-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2006-09",
            label: "September 2006",
            position: "2006-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2006-10",
            label: "October 2006",
            position: "2006-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2006-11",
            label: "November 2006",
            position: "2006-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2006-12",
            label: "December 2006",
            position: "2006-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2007-01",
            label: "January 2007",
            position: "2007-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2007-02",
            label: "February 2007",
            position: "2007-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2007-03",
            label: "March 2007",
            position: "2007-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2007-04",
            label: "April 2007",
            position: "2007-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2007-05",
            label: "May 2007",
            position: "2007-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2007-06",
            label: "June 2007",
            position: "2007-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2007-07",
            label: "July 2007",
            position: "2007-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2007-08",
            label: "August 2007",
            position: "2007-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2007-09",
            label: "September 2007",
            position: "2007-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2007-10",
            label: "October 2007",
            position: "2007-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2007-11",
            label: "November 2007",
            position: "2007-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2007-12",
            label: "December 2007",
            position: "2007-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2008-01",
            label: "January 2008",
            position: "2008-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2008-02",
            label: "February 2008",
            position: "2008-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2008-03",
            label: "March 2008",
            position: "2008-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2008-04",
            label: "April 2008",
            position: "2008-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2008-05",
            label: "May 2008",
            position: "2008-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2008-06",
            label: "June 2008",
            position: "2008-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2008-07",
            label: "July 2008",
            position: "2008-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2008-08",
            label: "August 2008",
            position: "2008-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2008-09",
            label: "September 2008",
            position: "2008-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2008-10",
            label: "October 2008",
            position: "2008-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2008-11",
            label: "November 2008",
            position: "2008-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2008-12",
            label: "December 2008",
            position: "2008-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2009-01",
            label: "January 2009",
            position: "2009-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2009-02",
            label: "February 2009",
            position: "2009-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2009-03",
            label: "March 2009",
            position: "2009-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2009-04",
            label: "April 2009",
            position: "2009-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2009-05",
            label: "May 2009",
            position: "2009-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2009-06",
            label: "June 2009",
            position: "2009-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2009-07",
            label: "July 2009",
            position: "2009-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2009-08",
            label: "August 2009",
            position: "2009-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2009-09",
            label: "September 2009",
            position: "2009-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2009-10",
            label: "October 2009",
            position: "2009-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2009-11",
            label: "November 2009",
            position: "2009-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2009-12",
            label: "December 2009",
            position: "2009-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2010-01",
            label: "January 2010",
            position: "2010-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2010-02",
            label: "February 2010",
            position: "2010-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2010-03",
            label: "March 2010",
            position: "2010-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2010-04",
            label: "April 2010",
            position: "2010-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2010-05",
            label: "May 2010",
            position: "2010-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2010-06",
            label: "June 2010",
            position: "2010-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2010-07",
            label: "July 2010",
            position: "2010-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2010-08",
            label: "August 2010",
            position: "2010-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2010-09",
            label: "September 2010",
            position: "2010-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2010-10",
            label: "October 2010",
            position: "2010-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2010-11",
            label: "November 2010",
            position: "2010-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2010-12",
            label: "December 2010",
            position: "2010-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2011-01",
            label: "January 2011",
            position: "2011-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2011-02",
            label: "February 2011",
            position: "2011-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2011-03",
            label: "March 2011",
            position: "2011-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2011-04",
            label: "April 2011",
            position: "2011-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2011-05",
            label: "May 2011",
            position: "2011-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2011-06",
            label: "June 2011",
            position: "2011-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2011-07",
            label: "July 2011",
            position: "2011-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2011-08",
            label: "August 2011",
            position: "2011-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2011-09",
            label: "September 2011",
            position: "2011-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2011-10",
            label: "October 2011",
            position: "2011-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2011-11",
            label: "November 2011",
            position: "2011-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2011-12",
            label: "December 2011",
            position: "2011-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2012-01",
            label: "January 2012",
            position: "2012-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2012-02",
            label: "February 2012",
            position: "2012-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2012-03",
            label: "March 2012",
            position: "2012-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2012-04",
            label: "April 2012",
            position: "2012-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2012-05",
            label: "May 2012",
            position: "2012-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2012-06",
            label: "June 2012",
            position: "2012-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2012-07",
            label: "July 2012",
            position: "2012-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2012-08",
            label: "August 2012",
            position: "2012-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2012-09",
            label: "September 2012",
            position: "2012-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2012-10",
            label: "October 2012",
            position: "2012-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2012-11",
            label: "November 2012",
            position: "2012-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2012-12",
            label: "December 2012",
            position: "2012-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2013-01",
            label: "January 2013",
            position: "2013-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2013-02",
            label: "February 2013",
            position: "2013-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2013-03",
            label: "March 2013",
            position: "2013-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2013-04",
            label: "April 2013",
            position: "2013-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2013-05",
            label: "May 2013",
            position: "2013-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2013-06",
            label: "June 2013",
            position: "2013-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2013-07",
            label: "July 2013",
            position: "2013-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2013-08",
            label: "August 2013",
            position: "2013-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2013-09",
            label: "September 2013",
            position: "2013-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2013-10",
            label: "October 2013",
            position: "2013-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2013-11",
            label: "November 2013",
            position: "2013-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2013-12",
            label: "December 2013",
            position: "2013-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2014-01",
            label: "January 2014",
            position: "2014-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2014-02",
            label: "February 2014",
            position: "2014-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2014-03",
            label: "March 2014",
            position: "2014-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2014-04",
            label: "April 2014",
            position: "2014-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2014-05",
            label: "May 2014",
            position: "2014-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2014-06",
            label: "June 2014",
            position: "2014-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2014-07",
            label: "July 2014",
            position: "2014-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2014-08",
            label: "August 2014",
            position: "2014-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2014-09",
            label: "September 2014",
            position: "2014-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2014-10",
            label: "October 2014",
            position: "2014-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2014-11",
            label: "November 2014",
            position: "2014-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2014-12",
            label: "December 2014",
            position: "2014-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2015-01",
            label: "January 2015",
            position: "2015-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2015-02",
            label: "February 2015",
            position: "2015-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2015-03",
            label: "March 2015",
            position: "2015-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2015-04",
            label: "April 2015",
            position: "2015-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2015-05",
            label: "May 2015",
            position: "2015-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2015-06",
            label: "June 2015",
            position: "2015-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2015-07",
            label: "July 2015",
            position: "2015-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2015-08",
            label: "August 2015",
            position: "2015-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2015-09",
            label: "September 2015",
            position: "2015-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2015-10",
            label: "October 2015",
            position: "2015-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2015-11",
            label: "November 2015",
            position: "2015-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2015-12",
            label: "December 2015",
            position: "2015-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2016-01",
            label: "January 2016",
            position: "2016-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2016-02",
            label: "February 2016",
            position: "2016-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2016-03",
            label: "March 2016",
            position: "2016-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2016-04",
            label: "April 2016",
            position: "2016-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2016-05",
            label: "May 2016",
            position: "2016-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2016-06",
            label: "June 2016",
            position: "2016-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2016-07",
            label: "July 2016",
            position: "2016-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2016-08",
            label: "August 2016",
            position: "2016-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2016-09",
            label: "September 2016",
            position: "2016-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2016-10",
            label: "October 2016",
            position: "2016-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2016-11",
            label: "November 2016",
            position: "2016-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2016-12",
            label: "December 2016",
            position: "2016-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2017-01",
            label: "January 2017",
            position: "2017-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2017-02",
            label: "February 2017",
            position: "2017-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2017-03",
            label: "March 2017",
            position: "2017-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2017-04",
            label: "April 2017",
            position: "2017-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2017-05",
            label: "May 2017",
            position: "2017-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2017-06",
            label: "June 2017",
            position: "2017-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2017-07",
            label: "July 2017",
            position: "2017-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2017-08",
            label: "August 2017",
            position: "2017-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2017-09",
            label: "September 2017",
            position: "2017-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2017-10",
            label: "October 2017",
            position: "2017-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2017-11",
            label: "November 2017",
            position: "2017-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2017-12",
            label: "December 2017",
            position: "2017-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2018-01",
            label: "January 2018",
            position: "2018-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2018-02",
            label: "February 2018",
            position: "2018-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2018-03",
            label: "March 2018",
            position: "2018-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2018-04",
            label: "April 2018",
            position: "2018-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2018-05",
            label: "May 2018",
            position: "2018-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2018-06",
            label: "June 2018",
            position: "2018-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2018-07",
            label: "July 2018",
            position: "2018-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2018-08",
            label: "August 2018",
            position: "2018-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2018-09",
            label: "September 2018",
            position: "2018-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2018-10",
            label: "October 2018",
            position: "2018-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2018-11",
            label: "November 2018",
            position: "2018-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2018-12",
            label: "December 2018",
            position: "2018-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2019-01",
            label: "January 2019",
            position: "2019-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2019-02",
            label: "February 2019",
            position: "2019-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2019-03",
            label: "March 2019",
            position: "2019-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2019-04",
            label: "April 2019",
            position: "2019-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2019-05",
            label: "May 2019",
            position: "2019-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2019-06",
            label: "June 2019",
            position: "2019-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2019-07",
            label: "July 2019",
            position: "2019-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2019-08",
            label: "August 2019",
            position: "2019-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2019-09",
            label: "September 2019",
            position: "2019-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2019-10",
            label: "October 2019",
            position: "2019-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2019-11",
            label: "November 2019",
            position: "2019-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2019-12",
            label: "December 2019",
            position: "2019-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2020-01",
            label: "January 2020",
            position: "2020-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2020-02",
            label: "February 2020",
            position: "2020-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2020-03",
            label: "March 2020",
            position: "2020-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2020-04",
            label: "April 2020",
            position: "2020-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2020-05",
            label: "May 2020",
            position: "2020-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2020-06",
            label: "June 2020",
            position: "2020-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2020-07",
            label: "July 2020",
            position: "2020-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2020-08",
            label: "August 2020",
            position: "2020-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2020-09",
            label: "September 2020",
            position: "2020-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2020-10",
            label: "October 2020",
            position: "2020-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2020-11",
            label: "November 2020",
            position: "2020-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2020-12",
            label: "December 2020",
            position: "2020-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2021-01",
            label: "January 2021",
            position: "2021-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2021-02",
            label: "February 2021",
            position: "2021-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2021-03",
            label: "March 2021",
            position: "2021-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2021-04",
            label: "April 2021",
            position: "2021-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2021-05",
            label: "May 2021",
            position: "2021-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2021-06",
            label: "June 2021",
            position: "2021-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2021-07",
            label: "July 2021",
            position: "2021-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2021-08",
            label: "August 2021",
            position: "2021-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2021-09",
            label: "September 2021",
            position: "2021-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2021-10",
            label: "October 2021",
            position: "2021-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2021-11",
            label: "November 2021",
            position: "2021-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2021-12",
            label: "December 2021",
            position: "2021-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2022-01",
            label: "January 2022",
            position: "2022-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2022-02",
            label: "February 2022",
            position: "2022-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2022-03",
            label: "March 2022",
            position: "2022-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2022-04",
            label: "April 2022",
            position: "2022-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2022-05",
            label: "May 2022",
            position: "2022-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2022-06",
            label: "June 2022",
            position: "2022-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2022-07",
            label: "July 2022",
            position: "2022-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2022-08",
            label: "August 2022",
            position: "2022-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2022-09",
            label: "September 2022",
            position: "2022-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2022-10",
            label: "October 2022",
            position: "2022-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2022-11",
            label: "November 2022",
            position: "2022-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2022-12",
            label: "December 2022",
            position: "2022-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2023-01",
            label: "January 2023",
            position: "2023-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2023-02",
            label: "February 2023",
            position: "2023-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2023-03",
            label: "March 2023",
            position: "2023-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2023-04",
            label: "April 2023",
            position: "2023-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2023-05",
            label: "May 2023",
            position: "2023-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2023-06",
            label: "June 2023",
            position: "2023-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2023-07",
            label: "July 2023",
            position: "2023-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2023-08",
            label: "August 2023",
            position: "2023-08",
          },
          {
            value: "https://ld.admin.ch/time/month/2023-09",
            label: "September 2023",
            position: "2023-09",
          },
          {
            value: "https://ld.admin.ch/time/month/2023-10",
            label: "October 2023",
            position: "2023-10",
          },
          {
            value: "https://ld.admin.ch/time/month/2023-11",
            label: "November 2023",
            position: "2023-11",
          },
          {
            value: "https://ld.admin.ch/time/month/2023-12",
            label: "December 2023",
            position: "2023-12",
          },
          {
            value: "https://ld.admin.ch/time/month/2024-01",
            label: "January 2024",
            position: "2024-01",
          },
          {
            value: "https://ld.admin.ch/time/month/2024-02",
            label: "February 2024",
            position: "2024-02",
          },
          {
            value: "https://ld.admin.ch/time/month/2024-03",
            label: "March 2024",
            position: "2024-03",
          },
          {
            value: "https://ld.admin.ch/time/month/2024-04",
            label: "April 2024",
            position: "2024-04",
          },
          {
            value: "https://ld.admin.ch/time/month/2024-05",
            label: "May 2024",
            position: "2024-05",
          },
          {
            value: "https://ld.admin.ch/time/month/2024-06",
            label: "June 2024",
            position: "2024-06",
          },
          {
            value: "https://ld.admin.ch/time/month/2024-07",
            label: "July 2024",
            position: "2024-07",
          },
          {
            value: "https://ld.admin.ch/time/month/2024-08",
            label: "August 2024",
            position: "2024-08",
          },
        ],
        related: [],
        hierarchy: null,
      },
      {
        __typename: "NominalDimension",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/product",
        label: "Product",
        description:
          "Products or goods that are the subject of market monitoring.",
        scaleType: "Nominal",
        order: 6,
        isNumerical: false,
        isKeyDimension: true,
        values: [
          {
            value: "https://agriculture.ld.admin.ch/foag/product/239",
            label: "Vollmilch UHT",
            identifier: "P_M1",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/240",
            label: "Milch Drink UHT",
            identifier: "P_M12",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/241",
            label: "Kochbutter (Die Butter)",
            identifier: "P_M13",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/254",
            label: "Vollrahm UHT 35%",
            identifier: "P_M27",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/255",
            label: "Halbrahm UHT 25%",
            identifier: "P_M28",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/256",
            label: "Kaffeerahm UHT 15%",
            identifier: "P_M29",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/257",
            label: "Appenzeller mild",
            identifier: "P_M3",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/258",
            label: "Fruchtjoghurt",
            identifier: "P_M30",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/263",
            label: "Vollmilch Past",
            identifier: "P_M39",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/264",
            label: "Raclettekäse",
            identifier: "P_M4",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/265",
            label: "Emmentaler",
            identifier: "P_M41",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/266",
            label: "Milch Drink Past",
            identifier: "P_M43",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/267",
            label: "Joghurt nature",
            identifier: "P_M44",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/268",
            label: "Gruyère",
            identifier: "P_M45",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/272",
            label: "Tomme",
            identifier: "P_M5",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/282",
            label: "Mozzarella",
            identifier: "P_M6",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/287",
            label: "Emmentaler mild",
            identifier: "P_M69",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/288",
            label: "Hüttenkäse nature 15%",
            identifier: "P_M7",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/289",
            label: "Emmentaler surchoix",
            identifier: "P_M70",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/290",
            label: "Gruyère mild",
            identifier: "P_M71",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/291",
            label: "Gruyère surchoix",
            identifier: "P_M72",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/292",
            label: "Appenzeller surchoix",
            identifier: "P_M73",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/293",
            label: "Magermilch UHT",
            identifier: "P_M74",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/294",
            label: "Bratbutter",
            identifier: "P_M75",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/295",
            label: "Sbrinz",
            identifier: "P_M76",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/296",
            label: "Tilsiter mild",
            identifier: "P_M77",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/297",
            label: "Tilsiter surchoix",
            identifier: "P_M78",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/298",
            label: "Tête de Moine",
            identifier: "P_M79",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/299",
            label: "Vorzugsbutter",
            identifier: "P_M8",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/300",
            label: "Vacherin fribourgeois",
            identifier: "P_M80",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/301",
            label: "Edamer CH",
            identifier: "P_M81",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/302",
            label: "Camembert 60%",
            identifier: "P_M82",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/303",
            label: "Weichkäse Croûte-mixte",
            identifier: "P_M83",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/304",
            label: "Brie CH 45%",
            identifier: "P_M84",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product/305",
            label: "Tilsiter",
            identifier: "P_M85",
          },
        ],
        related: [],
        hierarchy: [
          {
            label: "Appenzeller mild",
            value: "https://agriculture.ld.admin.ch/foag/product/257",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Appenzeller surchoix",
            value: "https://agriculture.ld.admin.ch/foag/product/292",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Bratbutter",
            value: "https://agriculture.ld.admin.ch/foag/product/294",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Brie CH 45%",
            value: "https://agriculture.ld.admin.ch/foag/product/304",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Camembert 60%",
            value: "https://agriculture.ld.admin.ch/foag/product/302",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Edamer CH",
            value: "https://agriculture.ld.admin.ch/foag/product/301",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Emmentaler",
            value: "https://agriculture.ld.admin.ch/foag/product/265",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Emmentaler mild",
            value: "https://agriculture.ld.admin.ch/foag/product/287",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Emmentaler surchoix",
            value: "https://agriculture.ld.admin.ch/foag/product/289",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Fruchtjoghurt",
            value: "https://agriculture.ld.admin.ch/foag/product/258",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Gruyère",
            value: "https://agriculture.ld.admin.ch/foag/product/268",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Gruyère mild",
            value: "https://agriculture.ld.admin.ch/foag/product/290",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Gruyère surchoix",
            value: "https://agriculture.ld.admin.ch/foag/product/291",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Halbrahm UHT 25%",
            value: "https://agriculture.ld.admin.ch/foag/product/255",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Hüttenkäse nature 15%",
            value: "https://agriculture.ld.admin.ch/foag/product/288",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Joghurt nature",
            value: "https://agriculture.ld.admin.ch/foag/product/267",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Kaffeerahm UHT 15%",
            value: "https://agriculture.ld.admin.ch/foag/product/256",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Kochbutter (Die Butter)",
            value: "https://agriculture.ld.admin.ch/foag/product/241",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Magermilch UHT",
            value: "https://agriculture.ld.admin.ch/foag/product/293",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Milch Drink Past",
            value: "https://agriculture.ld.admin.ch/foag/product/266",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Milch Drink UHT",
            value: "https://agriculture.ld.admin.ch/foag/product/240",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Mozzarella",
            value: "https://agriculture.ld.admin.ch/foag/product/282",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Raclettekäse",
            value: "https://agriculture.ld.admin.ch/foag/product/264",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Sbrinz",
            value: "https://agriculture.ld.admin.ch/foag/product/295",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Tilsiter",
            value: "https://agriculture.ld.admin.ch/foag/product/305",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Tilsiter mild",
            value: "https://agriculture.ld.admin.ch/foag/product/296",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Tilsiter surchoix",
            value: "https://agriculture.ld.admin.ch/foag/product/297",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Tomme",
            value: "https://agriculture.ld.admin.ch/foag/product/272",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Tête de Moine",
            value: "https://agriculture.ld.admin.ch/foag/product/298",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Vacherin fribourgeois",
            value: "https://agriculture.ld.admin.ch/foag/product/300",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Vollmilch Past",
            value: "https://agriculture.ld.admin.ch/foag/product/263",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Vollmilch UHT",
            value: "https://agriculture.ld.admin.ch/foag/product/239",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Vollrahm UHT 35%",
            value: "https://agriculture.ld.admin.ch/foag/product/254",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Vorzugsbutter",
            value: "https://agriculture.ld.admin.ch/foag/product/299",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Weichkäse Croûte-mixte",
            value: "https://agriculture.ld.admin.ch/foag/product/303",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
        ],
      },
      {
        __typename: "NominalDimension",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
        label: "Product subgroup",
        description:
          "Products or goods grouped together in subgroups that are the subject of market observation.",
        scaleType: "Nominal",
        order: 7,
        isNumerical: false,
        isKeyDimension: false,
        values: [
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/1",
            label: "Appenzeller",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/16",
            label: "Emmentaler",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/18",
            label: "Gruyère",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/19",
            label: "Halbrahm",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/20",
            label: "Hüttenkäse",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/23",
            label: "Joghurt andere Früchte",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/24",
            label: "Joghurt nature",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/25",
            label: "Kaffeerahm",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/29",
            label: "Kochbutter",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/3",
            label: "Bratbutter",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/39",
            label: "Magermilch",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/4",
            label: "Brie CH 45%",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/41",
            label: "Milch Drink",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/42",
            label: "Mozzarella",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/43",
            label: "Raclettekäse",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/47",
            label: "Sbrinz",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/63",
            label: "Tête de Moine",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/64",
            label: "Tilsiter",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/65",
            label: "Tomme",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/66",
            label: "Vacherin fribourgeois",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/71",
            label: "Vollmilch",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/73",
            label: "Vollrahm",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/74",
            label: "Vorzugsbutter",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/75",
            label: "Weichkäse Croûte-mixte",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/8",
            label: "Camembert 60%",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/9",
            label: "Edamer CH",
          },
        ],
        related: [],
        hierarchy: [
          {
            label: "Appenzeller",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/1",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Bratbutter",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/3",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Brie CH 45%",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/4",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Camembert 60%",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/8",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Edamer CH",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/9",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Emmentaler",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/16",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Gruyère",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/18",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Halbrahm",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/19",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Hüttenkäse",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/20",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Joghurt andere Früchte",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/23",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Joghurt nature",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/24",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Kaffeerahm",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/25",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Kochbutter",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/29",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Magermilch",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/39",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Milch Drink",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/41",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Mozzarella",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/42",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Raclettekäse",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/43",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Sbrinz",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/47",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Tilsiter",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/64",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Tomme",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/65",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Tête de Moine",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/63",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Vacherin fribourgeois",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/66",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Vollmilch",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/71",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Vollrahm",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/73",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Vorzugsbutter",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/74",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Weichkäse Croûte-mixte",
            value: "https://agriculture.ld.admin.ch/foag/product-subgroup/75",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-subgroup",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
        ],
      },
      {
        __typename: "NominalDimension",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/product-group",
        label: "Product group",
        description:
          "Products or goods grouped together that are the subject of market monitoring.",
        scaleType: "Nominal",
        order: 8,
        isNumerical: false,
        isKeyDimension: false,
        values: [
          {
            value: "https://agriculture.ld.admin.ch/foag/product-group/10",
            label: "Rahm",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-group/2",
            label: "Butter",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-group/4",
            label: "Joghurt",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-group/6",
            label: "Käse",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/product-group/7",
            label: "Konsummilch",
          },
        ],
        related: [],
        hierarchy: [
          {
            label: "Butter",
            value: "https://agriculture.ld.admin.ch/foag/product-group/2",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-group",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Joghurt",
            value: "https://agriculture.ld.admin.ch/foag/product-group/4",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-group",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Konsummilch",
            value: "https://agriculture.ld.admin.ch/foag/product-group/7",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-group",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Käse",
            value: "https://agriculture.ld.admin.ch/foag/product-group/6",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-group",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
          {
            label: "Rahm",
            value: "https://agriculture.ld.admin.ch/foag/product-group/10",
            depth: -1,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/product-group",
            hasValue: true,
            position: -1,
            identifier: "",
            children: [],
          },
        ],
      },
      {
        __typename: "NominalDimension",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/market",
        label: "Market",
        description: "Agricultural or food market of the product.",
        scaleType: "Nominal",
        order: 9,
        isNumerical: false,
        isKeyDimension: false,
        values: [
          {
            value: "https://agriculture.ld.admin.ch/foag/market/3",
            label: "Milch und Milchprodukte",
          },
        ],
        related: [],
        hierarchy: null,
      },
      {
        __typename: "NominalDimension",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/production-system",
        label: "Production system",
        description:
          "Method of cultivation or husbandry according to which a product is produced.",
        scaleType: "Nominal",
        order: 10,
        isNumerical: false,
        isKeyDimension: true,
        values: [
          {
            value: "https://agriculture.ld.admin.ch/foag/production-system/1",
            label: "Organic",
          },
          {
            value: "https://agriculture.ld.admin.ch/foag/production-system/3",
            label: "Conventional",
          },
        ],
        related: [],
        hierarchy: null,
      },
      {
        __typename: "NominalDimension",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/value-chain",
        label: "Value chain",
        description:
          "Simplified statement on the processing and trade stage of a product.",
        scaleType: "Nominal",
        order: 11,
        isNumerical: false,
        isKeyDimension: false,
        values: [
          {
            value: "https://agriculture.ld.admin.ch/foag/value-chain/6",
            label: "Consumption",
          },
        ],
        related: [],
        hierarchy: null,
      },
      {
        __typename: "NominalDimension",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/value-chain-detail",
        label: "Value chain detail",
        description:
          "Detailed information on the processing and trade stage of a product.",
        scaleType: "Nominal",
        order: 12,
        isNumerical: false,
        isKeyDimension: true,
        values: [
          {
            value: "https://agriculture.ld.admin.ch/foag/value-chain-detail/18",
            label: "Ex-retail",
          },
        ],
        related: [],
        hierarchy: [
          {
            label: "Consumption",
            value: "https://agriculture.ld.admin.ch/foag/value-chain/6",
            children: [
              {
                label: "Ex-retail",
                value:
                  "https://agriculture.ld.admin.ch/foag/value-chain-detail/18",
                children: [],
                depth: 1,
                dimensionId:
                  "https://agriculture.ld.admin.ch/foag/dimension/value-chain-detail",
                hasValue: true,
              },
            ],
            depth: 0,
            dimensionId:
              "https://agriculture.ld.admin.ch/foag/dimension/value-chain-detail",
            hasValue: false,
            hierarchyName: "Value Chain - Detail",
          },
        ],
      },
      {
        __typename: "NominalDimension",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/data-source",
        label: "Data source",
        description: "Source to be indicated when using the data.",
        scaleType: "Nominal",
        order: 13,
        isNumerical: false,
        isKeyDimension: false,
        values: [
          {
            value: "https://agriculture.ld.admin.ch/foag/data-source/1",
            label: "FOAG, Market Analysis",
          },
        ],
        related: [],
        hierarchy: null,
      },
      {
        __typename: "NominalDimension",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/data-method",
        label: "Data method",
        description: "Method used to compile / create the data.",
        scaleType: "Nominal",
        order: 14,
        isNumerical: false,
        isKeyDimension: false,
        values: [
          {
            value: "https://agriculture.ld.admin.ch/foag/data-method/5",
            label: "Realised value",
          },
        ],
        related: [],
        hierarchy: null,
      },
      {
        __typename: "NominalDimension",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/product-properties",
        label: "Product properties",
        description:
          "Characteristics of the product that describe its quality or condition.",
        scaleType: "Nominal",
        order: 15,
        isNumerical: false,
        isKeyDimension: false,
        values: [
          {
            value: "https://agriculture.ld.admin.ch/foag/product-properties/0",
            label: "NA",
          },
        ],
        related: [],
        hierarchy: null,
      },
      {
        __typename: "NominalDimension",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/product-origin",
        label: "Product origin",
        description: "Geographical area from which the product originates.",
        scaleType: "Nominal",
        order: 16,
        isNumerical: false,
        isKeyDimension: false,
        values: [
          {
            value: "https://agriculture.ld.admin.ch/foag/product-origin/1",
            label: "Switzerland",
          },
        ],
        related: [],
        hierarchy: null,
      },
      {
        __typename: "NominalDimension",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/sales-region",
        label: "Sales region",
        description: "Geographical area in which a product is sold.",
        scaleType: "Nominal",
        order: 17,
        isNumerical: false,
        isKeyDimension: false,
        values: [
          {
            value: "https://agriculture.ld.admin.ch/foag/sales-region/1",
            label: "Switzerland",
          },
        ],
        related: [],
        hierarchy: null,
      },
      {
        __typename: "NominalDimension",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/foreign-trade",
        label: "Foreign trade",
        description:
          "Direction of foreign trade (import/export) and information on import or export quota.",
        scaleType: "Nominal",
        order: 18,
        isNumerical: false,
        isKeyDimension: false,
        values: [
          {
            value: "https://agriculture.ld.admin.ch/foag/foreign-trade/0",
            label: "NA",
          },
        ],
        related: [],
        hierarchy: null,
      },
      {
        __typename: "NominalDimension",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/usage",
        label: "Usage",
        description: "Statement of the use for which the product is intended.",
        scaleType: "Nominal",
        order: 19,
        isNumerical: false,
        isKeyDimension: false,
        values: [
          {
            value: "https://agriculture.ld.admin.ch/foag/usage/0",
            label: "NA",
          },
        ],
        related: [],
        hierarchy: null,
      },
      {
        __typename: "NominalDimension",
        cubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        id: "https://agriculture.ld.admin.ch/foag/dimension/cost-component",
        label: "Cost component",
        description:
          "Indication of whether currency details are with or without VAT.",
        scaleType: "Nominal",
        order: 20,
        isNumerical: false,
        isKeyDimension: false,
        values: [
          {
            value: "https://agriculture.ld.admin.ch/foag/cost-component/1",
            label: "incl. VAT",
          },
        ],
        related: [],
        hierarchy: null,
      },
    ].map((d) => ({
      ...d,
      id: stringifyComponentId({
        unversionedCubeIri: d.cubeIri,
        unversionedComponentIri: d.id,
      }),
      hierarchy: d.hierarchy?.map((h) => ({
        ...h,
        dimensionId: stringifyComponentId({
          unversionedCubeIri: d.cubeIri,
          unversionedComponentIri: h.value,
        }),
      })),
    })) as Dimension[];
    const potentialTimeRangeFilterIds = [
      stringifyComponentId({
        unversionedCubeIri:
          "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
        unversionedComponentIri:
          "https://agriculture.ld.admin.ch/foag/dimension/date",
      }),
    ];
    const formatLocale = getD3TimeFormatLocale("en");
    const result = getCombinedTemporalDimension({
      dimensions,
      potentialTimeRangeFilterIds,
      formatLocale,
    });
    expect(result.values.length).toBeGreaterThan(2);
    expect(result.values[0].value).toBe("2000-01");
    expect(result.values[result.values.length - 1].value).toBe("2024-08");
  });
});
