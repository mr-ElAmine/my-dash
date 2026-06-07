# API smoke metrics

Generated: 2026-05-27T10:16:55.421Z
API origin: http://backend:3000
Warmup: 2
Iterations: 20

| Endpoint | Status | Avg | P50 | P95 | Max | Avg bytes | Failures |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| health | 200 | 0.5 ms | 0.3 ms | 1 ms | 1.2 ms | 15 | 0 |
| auth_me | 200 | 1.3 ms | 1.1 ms | 2.7 ms | 2.9 ms | 261 | 0 |
| organizations_list | 200 | 1.2 ms | 1 ms | 2.7 ms | 2.8 ms | 573 | 0 |
| dashboard_stats | 200 | 3.2 ms | 2.6 ms | 5.1 ms | 6.2 ms | 267 | 0 |
| companies_list | 200 | 3 ms | 2.5 ms | 5.7 ms | 8.3 ms | 2943 | 0 |
| contacts_list | 200 | 1.9 ms | 1.6 ms | 2.1 ms | 5.8 ms | 1981 | 0 |
| quotes_list | 200 | 8.2 ms | 2 ms | 24 ms | 76 ms | 4859 | 0 |
| invoices_list | 200 | 2.5 ms | 2.2 ms | 4.2 ms | 5.3 ms | 8250 | 0 |
| notes_list | 200 | 2.1 ms | 1.7 ms | 3.9 ms | 6.1 ms | 891 | 0 |
| company_detail | 200 | 1.6 ms | 1.6 ms | 1.9 ms | 3 ms | 485 | 0 |
| quote_detail | 200 | 1.8 ms | 1.8 ms | 2 ms | 2.3 ms | 1672 | 0 |
| invoice_detail | 200 | 2.2 ms | 2 ms | 3.2 ms | 3.4 ms | 2181 | 0 |
| payments_list | 200 | 1.8 ms | 1.8 ms | 2.2 ms | 2.6 ms | 11 | 0 |

## Notes

- All endpoints were measured from the Docker audit network against the seeded local backend.
- These are lightweight smoke timings, not a load test.
- Mutating endpoints are intentionally excluded so the seed state stays stable.
