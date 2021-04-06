# COVID Vaccine Streamer Brazil

Streams data from the official government HTTP API for the progress of
vaccination against COVID in Brazil

## Notes

- [Official API Documentation](https://opendatasus.saude.gov.br/dataset/b772ee55-07cd-44d8-958f-b12edd004e0b/resource/5916b3a4-81e7-4ad5-adb6-b884ff198dc1/download/manual_api_vacina_covid-19.pdf)
  - The API is lacking functionality for sorting the data, and doesn't specify how the data is sorted by default, so right now the capture methods might not be optimal

## Usage

- Set up environment variables in `.env` file (or copy)
  - API_URL, API_USER, API_PASSWORD can be copied from `./config/.env.template`
  - PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE have to be set for connection to PostgreSQL Server
- Create table in PostgreSQL using `./config/schema.sql`
- run `npm run start`
