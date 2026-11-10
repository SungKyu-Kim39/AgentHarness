---
name: statistical-analysis
description: "분포·이상치·가설 검정·효과 크기·신뢰 구간·표본·인과 해석의 한계"
---

# L-Vibe offline adaptation

This is a reviewed static skill, not an executable plugin. Read only the relevant references. Local guidance needs no external Internet; citation URLs are attribution only. The model connection remains the configured intranet API.

분석 단위·무작위 배정·독립성·누락·표본 수와 가정을 먼저 확인한다. A/B에서는 SRM·사전 지정한 주 지표/MDE·검정력·효과 크기·신뢰 구간·다중 비교·중지 규칙을 확인한다. 반복 관측과 클러스터를 독립 표본으로 세지 않는다. p값은 귀무가설이 참일 확률이나 결과가 우연일 확률이 아니다. 유의하지 않다는 결과를 동등성 증명으로 표현하지 않는다. 실제 로컬 계산 근거 없이 p값·구간을 생성하지 않는다.

Use approved project reads/searches and host-mediated edits. Do not install packages, download dependencies, fetch remote documentation, deploy, enable hooks, change permissions, spawn agents, or send messages. A command, compiler, browser, database, test runner or SDK mentioned below is not installed by this skill. Use an approved local executor if available; otherwise report verification as not run. Local node_modules examples require an existing package and the appropriate Windows executable path. User decisions and host policy take precedence. See ADAPTATION.md for provenance and modifications.

---


# Statistical Analysis Skill

Descriptive statistics, trend analysis, outlier detection, hypothesis testing, and guidance on when to be cautious about statistical claims.

## Descriptive Statistics Methodology

### Central Tendency

Choose the right measure of center based on the data:

| Situation | Use | Why |
|---|---|---|
| Symmetric distribution, no outliers | Mean | Most efficient estimator |
| Skewed distribution | Median | Robust to outliers |
| Categorical or ordinal data | Mode | Only option for non-numeric |
| Highly skewed with outliers (e.g., revenue per user) | Median + mean | Report both; the gap shows skew |

**Always report mean and median together for business metrics.** If they diverge significantly, the data is skewed and the mean alone is misleading.

### Spread and Variability

- **Standard deviation**: How far values typically fall from the mean. Use with normally distributed data.
- **Interquartile range (IQR)**: Distance from p25 to p75. Robust to outliers. Use with skewed data.
- **Coefficient of variation (CV)**: StdDev / Mean. Use to compare variability across metrics with different scales.
- **Range**: Max minus min. Sensitive to outliers but gives a quick sense of data extent.

### Percentiles for Business Context

Report key percentiles to tell a richer story than mean alone:

```
p1:   Bottom 1% (floor / minimum typical value)
p5:   Low end of normal range
p25:  First quartile
p50:  Median (typical user)
p75:  Third quartile
p90:  Top 10% / power users
p95:  High end of normal range
p99:  Top 1% / extreme users
```

**Example narrative**: "The median session duration is 4.2 minutes, but the top 10% of users spend over 22 minutes per session, pulling the mean up to 7.8 minutes."

### Describing Distributions

Characterize every numeric distribution you analyze:

- **Shape**: Normal, right-skewed, left-skewed, bimodal, uniform, heavy-tailed
- **Center**: Mean and median (and the gap between them)
- **Spread**: Standard deviation or IQR
- **Outliers**: How many and how extreme
- **Bounds**: Is there a natural floor (zero) or ceiling (100%)?

## Trend Analysis and Forecasting

### Identifying Trends

**Moving averages** to smooth noise:
```python
# 7-day moving average (good for daily data with weekly seasonality)
df['ma_7d'] = df['metric'].rolling(window=7, min_periods=1).mean()

# 28-day moving average (smooths weekly AND monthly patterns)
df['ma_28d'] = df['metric'].rolling(window=28, min_periods=1).mean()
```

**Period-over-period comparison**:
- Week-over-week (WoW): Compare to same day last week
- Month-over-month (MoM): Compare to same month prior
- Year-over-year (YoY): Gold standard for seasonal businesses
- Same-day-last-year: Compare specific calendar day

**Growth rates**:
```
Simple growth: (current - previous) / previous
CAGR: (ending / beginning) ^ (1 / years) - 1
Log growth: ln(current / previous)  -- better for volatile series
```

### Seasonality Detection

Check for periodic patterns:
1. Plot the raw time series -- visual inspection first
2. Compute day-of-week averages: is there a clear weekly pattern?
3. Compute month-of-year averages: is there an annual cycle?
4. When comparing periods, always use YoY or same-period comparisons to avoid conflating trend with seasonality

### Forecasting (Simple Methods)

For business analysts (not data scientists), use straightforward methods:

- **Naive forecast**: Tomorrow = today. Use as a baseline.
- **Seasonal naive**: Tomorrow = same day last week/year.
- **Linear trend**: Fit a line to historical data. Only for clearly linear trends.
- **Moving average forecast**: Use trailing average as the forecast.

**Always communicate uncertainty**. Provide a range, not a point estimate:
- "We expect 10K-12K signups next month based on the 3-month trend"
- NOT "We will get exactly 11,234 signups next month"

**When to escalate to a data scientist**: Non-linear trends, multiple seasonalities, external factors (marketing spend, holidays), or when forecast accuracy matters for resource allocation.

## Outlier and Anomaly Detection

### Statistical Methods

**Z-score method** (for normally distributed data):
```python
z_scores = (df['value'] - df['value'].mean()) / df['value'].std()
outliers = df[abs(z_scores) > 3]  # More than 3 standard deviations
```

**IQR method** (robust to non-normal distributions):
```python
Q1 = df['value'].quantile(0.25)
Q3 = df['value'].quantile(0.75)
IQR = Q3 - Q1
lower_bound = Q1 - 1.5 * IQR
upper_bound = Q3 + 1.5 * IQR
outliers = df[(df['value'] < lower_bound) | (df['value'] > upper_bound)]
```

**Percentile method** (simplest):
```python
outliers = df[(df['value'] < df['value'].quantile(0.01)) |
              (df['value'] > df['value'].quantile(0.99))]
```

### Handling Outliers

Do NOT automatically remove outliers. Instead:

1. **Investigate**: Is this a data error, a genuine extreme value, or a different population?
2. **Data errors**: Fix or remove (e.g., negative ages, timestamps in year 1970)
3. **Genuine extremes**: Keep them but consider using robust statistics (median instead of mean)
4. **Different population**: Segment them out for separate analysis (e.g., enterprise vs. SMB customers)

**Report what you did**: "We excluded 47 records (0.3%) with transaction amounts >$50K, which represent bulk enterprise orders analyzed separately."

### Time Series Anomaly Detection

For detecting unusual values in a time series:

1. Compute expected value (moving average or same-period-last-year)
2. Compute deviation from expected
3. Flag deviations beyond a threshold (typically 2-3 standard deviations of the residuals)
4. Distinguish between point anomalies (single unusual value) and change points (sustained shift)

## Hypothesis Testing Basics

### When to Use

Use hypothesis testing when you need to determine whether an observed difference is likely real or could be due to random chance. Common scenarios:

- A/B test results: Is variant B actually better than A?
- Before/after comparison: Did the product change actually move the metric?
- Segment comparison: Do enterprise customers really have higher retention?

### The Framework

1. **Null hypothesis (H0)**: There is no difference (the default assumption)
2. **Alternative hypothesis (H1)**: There is a difference
3. **Choose significance level (alpha)**: Typically 0.05 (5% chance of false positive)
4. **Compute test statistic and p-value**
5. **Interpret**: Compare p with the pre-specified alpha under the planned design; report effect size, interval, assumptions and multiplicity, not a probability that a variant is better

### Common Tests

| Scenario | Test | When to Use |
|---|---|---|
| Compare two group means | t-test (independent) | Normal data, two groups |
| Compare two group proportions | z-test for proportions | Conversion rates, binary outcomes |
| Compare paired measurements | Paired t-test | Before/after on same entities |
| Compare 3+ group means | ANOVA | Multiple segments or variants |
| Non-normal data, two groups | Mann-Whitney U test | Skewed metrics, ordinal data |
| Association between categories | Chi-squared test | Two categorical variables |

### Practical Significance vs. Statistical Significance

**Statistical significance** means the observed statistic is incompatible with the null model at the planned threshold under its assumptions; it does not assign a probability to the null or prove causation.

**Practical significance** means the difference is large enough to matter for business decisions.

A difference can be statistically significant but practically meaningless (common with large samples). Always report:
- **Effect size**: How big is the difference? (e.g., "Variant B improved conversion by 0.3 percentage points")
- **Confidence interval**: What's the range of plausible true effects?
- **Business impact**: What does this translate to in revenue, users, or other business terms?

### Sample Size Considerations

- Small samples produce unreliable results, even with significant p-values
- Rule of thumb for proportions: Need at least 30 events per group for basic reliability
- For detecting small effects (e.g., 1% conversion rate change), you may need thousands of observations per group
- If your sample is small, say so: "With only 200 observations per group, we have limited power to detect effects smaller than X%"

## When to Be Cautious About Statistical Claims

### Correlation Is Not Causation

When you find a correlation, explicitly consider:
- **Reverse causation**: Maybe B causes A, not A causes B
- **Confounding variables**: Maybe C causes both A and B
- **Coincidence**: With enough variables, spurious correlations are inevitable

**What you can say**: "Users who use feature X have 30% higher retention"
**What you cannot say without more evidence**: "Feature X causes 30% higher retention"

### Multiple Comparisons Problem

When you test many hypotheses, some will be "significant" by chance:
- Testing 20 metrics at p=0.05 means ~1 will be falsely significant
- If you looked at many segments before finding one that's different, note that
- Adjust for multiple comparisons with Bonferroni correction (divide alpha by number of tests) or report how many tests were run

### Simpson's Paradox

A trend in aggregated data can reverse when data is segmented:
- Always check whether the conclusion holds across key segments
- Example: Overall conversion goes up, but conversion goes down in every segment -- because the mix shifted toward a higher-converting segment

### Survivorship Bias

You can only analyze entities that "survived" to be in your dataset:
- Analyzing active users ignores those who churned
- Analyzing successful companies ignores those that failed
- Always ask: "Who is missing from this dataset, and would their inclusion change the conclusion?"

### Ecological Fallacy

Aggregate trends may not apply to individuals:
- "Countries with higher X have higher Y" does NOT mean "individuals with higher X have higher Y"
- Be careful about applying group-level findings to individual cases

### Anchoring on Specific Numbers

Be wary of false precision:
- "Churn will be 4.73% next quarter" implies more certainty than is warranted
- Prefer ranges: "We expect churn between 4-6% based on historical patterns"
- Round appropriately: "About 5%" is often more honest than "4.73%"
