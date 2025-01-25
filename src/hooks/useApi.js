import React, { useEffect, useState } from "react";
const useApi = (restCall, payload) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const triggerApi = async () => {
        setLoading(true);
        
        let resp = ''
        try {
            resp = await restCall(payload)
            setData(resp.data)
            setLoading(false);
            console.log(resp.data)
        }     
          catch(error) {
            setError(error);
            setLoading(false);
          };
      };

    return { triggerApi, data, error, loading };
  };

  export default useApi