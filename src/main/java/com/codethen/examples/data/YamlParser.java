package com.codethen.examples.data;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;

public class YamlParser {

    public static void main(String[] args) throws JsonProcessingException {
        System.out.println(convertYamlToJson("number: 123\ntext: hello\n"));
        System.out.println(convertJsonToYaml("{\"number\":123,\"text\":\"hello\"}"));
    }

    private static String convertYamlToJson(String yaml) throws JsonProcessingException {
        ObjectMapper yamlReader = new ObjectMapper(new YAMLFactory());
        Object obj = yamlReader.readValue(yaml, Object.class);

        ObjectMapper jsonWriter = new ObjectMapper();
        return jsonWriter.writeValueAsString(obj);
    }

    private static String convertJsonToYaml(String json) throws JsonProcessingException {
        ObjectMapper jsonReader = new ObjectMapper();
        Object obj = jsonReader.readValue(json, Object.class);

        ObjectMapper yamlWriter = new ObjectMapper(new YAMLFactory());
        return yamlWriter.writeValueAsString(obj);
    }
}
