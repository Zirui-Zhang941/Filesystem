# Starting Out
## The Basics Given
Once you have Spring Boot started, they have a nice demo that you can use to create a starting document. Once you have this you can start playing with it to find your way around. 

You will see that you start with one file, the DemoAppApplication.java. This is a simple file that just opens a port that we can send out outputs through. 

Once you are satisfied, we need to first look at how to send an API with this. For this we need to use the a @RestController. 

```
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class CollerClassTest {
    @GetMapping("/")
    public String index() {
        return "Hello World";
    }
}
```

What the ```@RestController``` will do is allow for us to send and recieve information. The ```@RestController``` compared to the ```@Controller``` is that it has a @ResponceBody built in so when we send information out of the port it does it in the form of a http rather then as a JSON object. (I think)

### @Controller
`@Controller` is used to mark a class as a controller component in a Spring MVC application.
It indicates that the annotated class serves the role of a controller, **handling incoming HTTP requests and producing HTTP responses**.
Controllers are responsible for processing user requests, interacting with the business logic layer, and determining the appropriate view to render as a response
```
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MyController {

    @GetMapping("/hello")
    public String hello() {
        return "hello"; // Returns the view name to be resolved by a view resolver
    }
}

```

### @ControllerAdvice
`@ControllerAdvice` is used to define global exception handlers and global model attribute methods in a Spring MVC application. It is commonly used to **define error handling logic or to add common model attributes across multiple controllers**. It can be used to handle exceptions thrown from controllers, performing exception translation, logging, or returning custom error responses.
```
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public String handleException(Exception e) {
        // Custom error handling logic
        return "error"; // Returns the view name for error page
    }
}

```

## Changing the output port
So from this we can see that our controller will allow for us to send "Hello World" in the form of a http to our open port, which by default is 8080. We want to change this though so that we are sending information out of a different port. For this we need to customize the WebServerFactory. 

First we want to create a class that will interact with the default WebServerFactory and change the port. 

```
@Component
public class ServerPortCustomizer implements WebServerFactoryCustomizer<ConfigurableWebServerFactory> {
    @Override
    public void customize(ConfigurableWebServerFactory factory) {
        factory.setPort(8086) //Can be any port that we want to send though
    }
}
```
So now if we rerun the program we can see that we are sending a HTTP out of the localport:8086 rather then 8080. 

## HTTP Interface
Spring Framework provide annotation to handle **HTTP requests**. 

`@RequestMapping` is the annotation used to map all the incoming HTTP request URLs to the corresponding controller methods. If `@RequestMapping` annotation has been used to map the same HTTP requests, we have to specified the HTTP request type as the annotation attribute *method*.
```
@RequestMapping(value = "/users", method = RequestMethod.GET)
public Users getUsers() { ... }

@RequestMapping(value = "/users/{id}", method = RequestMethod.GET)
public User getUser(@PathVariable("id") String id) { ... }

@RequestMapping(value = "/users", method = RequestMethod.POST)
public User createUser(User user) { ... }
```


`@GetMapping()` is annotated methods handle the HTTP GET requests matched with the given URI expression, which a composed version of `@RequestMapping` annotation that acts as a shortcut for `@RequestMapping(method = RequestMethod.GET)`. 
```
@GetMapping(value = "/users")
public Users getUsers() { ... }
```

`@PostMapping` is annotated methods handle the HTTP POST requests matched with the given URI expression, which is a specialized version of `@RequestMapping` annotation that acts as a shortcut for `@RequestMapping(method = RequestMethod.POST`. As a best practice, always specify the media types (XML, JSON etc.) using the **‘consumes’** and **‘produces’** attributes.
```
@PostMapping(value = "/users", 
        consumes = MediaType.APPLICATION_JSON_VALUE, 
        produces = MediaType.APPLICATION_JSON_VALUE)
public ResponseEntity<User> create(@RequestBody User newUser) {...}
```

`@PutMapping`

`@DeleteMapping`

`@PatchMapping`

## Exceptions
`@Controller` and `@ControllerAdvice` classes can have `@ExceptionHandler` methods to handle exceptions from controller methods.
The exception can match against a top-level exception being propagated (that is, a direct IOException being thrown) or against the immediate cause within a top-level wrapper exception (for example, an IOException wrapped inside an IllegalStateException).
```
@Controller
public class SimpleController {

	// ...

	@ExceptionHandler
	public ResponseEntity<String> handle(IOException ex) {
		// ...
	}
}
```


## These are things that I still need to research

 - [ ] @Bean

 - [ ] @ResponseBody

 - [ ] @Service

 - [ ] @Autowired

 - [ ] @SpringBootTest

 - [ ] @Test

 - [ ] @MockBean

  - [ ] The JS side


